import HeadHTML from "../components/HeadHTML";
import { useState } from "react";
import { useQuery } from "react-query";
//Material-ui
import { Drawer, LinearProgress, Grid, Badge } from "@material-ui/core";
import { AddShoppingCart } from "@material-ui/icons";
//styled-components
import { Wrapper, StyledButton } from "./index.styles";
//components
import Item from "../components/Item/Item";
import Cart from "../components/Cart/Cart";

export type CartItemType = {
  id: number;
  category: string;
  description: string;
  image: string;
  price: number;
  title: string;
  amount: number;
};

const getProducts = async (): Promise<CartItemType[]> =>
  await (await fetch("https://fakestoreapi.com/products")).json();

export default function Home() {
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([] as CartItemType[]);
  const { data, isLoading, error } = useQuery<CartItemType[]>(
    "products",
    getProducts
  );

  const handleAddToCart = (clickedItem: CartItemType) => {
    setCartItems((prev) => {
      //is item already in?
      const inCart = prev.find((item) => item.id === clickedItem.id);
      if (inCart) {
        return prev.map((item) =>
          item.id === clickedItem.id
            ? { ...item, amount: item.amount + 1 }
            : item
        );
      }
      return [...prev, { ...clickedItem, amount: 1 }];
    });
  };

  const getTotalItems = (items: CartItemType[]) => {
    return items.reduce((acc: number, item) => acc + item.amount, 0);
  };

  // const handleRemoveFromCart = (id: number) =>
  //   setCartItems(cartItems.filter((item) => item.id !== id));

  const handleRemoveFromCart = (id: number) =>
    setCartItems((prev) =>
      prev.reduce((acc, item) => {
        if (item.id === id) {
          if (item.amount === 1) return acc;
          return [...acc, { ...item, amount: item.amount - 1 }];
        } else {
          return [...acc, item];
        }
      }, [] as CartItemType[])
    );

  if (isLoading) return <LinearProgress />;

  if (error) return <div>Error occurred...</div>;

  return (
    <div>
      <HeadHTML />

      <main>
        <Wrapper>
          <Drawer
            anchor="right"
            open={cartOpen}
            onClose={() => setCartOpen(false)}
          >
            <Cart
              cartItems={cartItems}
              addToCart={handleAddToCart}
              removeFromCart={handleRemoveFromCart}
            />
          </Drawer>
          <StyledButton onClick={() => setCartOpen(true)}>
            <Badge badgeContent={getTotalItems(cartItems)} color="error">
              <AddShoppingCart />
            </Badge>
          </StyledButton>
          <Grid container spacing={3}>
            {data?.map((item) => (
              <Grid key={item.id} item xs={12} sm={4}>
                <Item item={item} handleAddToCart={handleAddToCart} />
              </Grid>
            ))}
          </Grid>
        </Wrapper>
      </main>
    </div>
  );
}
