import React from "react";
import Layout from "../Components/Layout/Layout";
import { useCart } from "../context/Cart";
import { useAuth } from "../context/auth";
import { useNavigate } from "react-router-dom";
import DropIn from "braintree-web-drop-in-react";
import { useState } from "react";
import axios from "axios";
import { useEffect } from "react";
import { toast } from "react-hot-toast";

const CartPage = () => {
  const [auth, setAuth] = useAuth();
  const [cart, setCart] = useCart();
  const [clientToken, setClientToken] = useState("");
  const [instance, setInstance] = useState("");
  const [loding, setLoding] = useState(false);
  const navigate = useNavigate();

  //total price
  const totalPrice = () => {
    try {
      let total = 0;
      cart?.map((item) => {
        total += item.price;
      });
      return total.toLocaleString("hi", {
        style: "currency",
        currency: "INR",
      });
    } catch (error) {
      console.log(error);
    }
  };

  //Delete Item
  const removeCartItem = (pid) => {
    try {
      let myCart = [...cart];
      let index = myCart.findIndex((item) => item._id === pid);
      myCart.splice(index, 1);
      setCart(myCart);
      localStorage.setItem("cart", JSON.stringify(myCart));
    } catch (error) {
      console.error(error);
    }
  };

  //get payment gatway token
  const getToken = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/v1/product/braintree/token"
      );
      setClientToken(data?.clientToken);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getToken();
  }, [auth?.token]);

  //handle payment
  const handlePayment = async () => {
    try {
      setLoding(true);
      const { nonce } = await instance.requestPaymentMethod();
      const { data } = await axios.post(
        "http://localhost:5000/api/v1/product/braintree/payment  ",
        { nonce, cart }
      );
      setLoding(false);
      localStorage.removeItem("cart");
      setCart([]);
      navigate('/dashboard/user/orders');
      toast.success("Payment Completed Successfully");
    } catch (error) {
      console.log(error);
      setLoding(false);
    }
  };

  return (
    <Layout title={"Kharido - Cart"}>
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <h1 className="text-center bg-dark p-2 text-warning">
              {`Hello ${auth?.token && auth?.user?.name}`}
            </h1>
            <h4 className="text-center">
              {cart?.length
                ? `You have ${cart.length} items in your cart ${
                    auth?.token ? "" : "Please login to checkout"
                  }`
                : "You Cart is Empty"}
            </h4>
          </div>
        </div>
        <div className="row">
          <div className="col-md-8">
            {cart?.map((p) => (
              <div className="row mb-3 card flex-row" key={p._id}>
                <div className="col-md-4">
                  <img
                    src={`http://localhost:5000/api/v1/product/product-photo/${p._id}`}
                    className="card-img-top"
                    alt={p.name}
                    style={{ width: "200px", height: "200px" }}
                  />
                </div>
                <div
                  className="col-md-8"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    borderLeft: "2px solid black",
                  }}
                >
                  <div>
                    <h4>{p.name}</h4>
                    <p>
                      <b>Description : </b>
                      {p.description.substring(0, 30)}
                    </p>
                    <p>
                      <b>Price :</b> {p.price}
                    </p>
                    <button
                      className="btn btn-danger"
                      onClick={() => removeCartItem(p._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="col-md-3 text-center ms-5">
            <h4 className="text-warning">Cart Summary</h4>
            <p>Total | Checkout | Payment</p>
            <hr />
            <h4>
              {" "}
              Total : <span className="text-success">{totalPrice()}</span>
            </h4>
            {auth?.user?.address ? (
              <>
                <div className="mb-3 mt-5">
                  <h4 className="text-warning">Current Address : </h4>
                  <h6>{auth?.user?.address}</h6>
                  <button
                    className="btn btn-outline-warning mt-3"
                    onClick={() => navigate("/dashboard/user/profile")}
                  >
                    Update Address
                  </button>
                </div>
              </>
            ) : (
              <div className="mb-3">
                {auth?.token ? (
                  <button
                    className="btn btn-outline-warning"
                    onClick={() => navigate("/dashboard/user/profile")}
                  >
                    Update Address
                  </button>
                ) : (
                  <button
                    className="btn btn-outline-warning"
                    onClick={() =>
                      navigate("/login", {
                        state: "/cart",
                      })
                    }
                  >
                    Please Login to Checkout
                  </button>
                )}
              </div>
            )}
            <div className="mt-2">
              {!clientToken || !cart?.length ? (
                ""
              ) : (
                <>
                  <DropIn
                    options={{
                      authorization: clientToken,
                      paypal: {
                        flow: "vault",
                      },
                    }}
                    onInstance={(instance) => setInstance(instance)}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={handlePayment}
                    disabled={loding || !instance || !auth?.user?.address}
                  >
                    {loding ? "Processing..." : "Make Payment"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;
