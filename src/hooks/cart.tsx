import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsOnStorage = await AsyncStorage.getItem('@GoMarketplace:products')

      if(productsOnStorage) {
        setProducts([ ...JSON.parse(productsOnStorage)])
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(async product => {
    const productOnCart = products.find(prod => prod.id == product.id)

    if(productOnCart) {
      await increment(product.id)
    } else {
      const newProduct = [...products, { ...product, quantity: 1 }]
      setProducts(newProduct)

      await AsyncStorage.setItem('@GoMarketplace:products', JSON.stringify(newProduct))
    }
  }, [products]);

  const increment = useCallback(async id => {
    const addedProducts = products.map(product => product.id === id ? { ...product, quantity: product.quantity + 1 } : product )
    setProducts(addedProducts)

    await AsyncStorage.setItem('@GoMarketplace:products', JSON.stringify(addedProducts))
  }, [products]);

  const decrement = useCallback(async id => {
    const subtractedProducts = products.map(product => product.id === id ? { ...product, quantity: product.quantity - 1 } : product )
    setProducts(subtractedProducts)

    await AsyncStorage.setItem('@GoMarketplace:products', JSON.stringify(subtractedProducts))
  }, [products]);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
