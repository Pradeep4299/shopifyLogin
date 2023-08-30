const express = require("express");
const cors = require("cors");
const axios = require("axios");
const bodyParser = require("body-parser");
const app = express();

require("dotenv").config();

app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true })); // to get the domain value

app.set("views", __dirname + "/views");
app.set("view engine", "ejs"); // Use EJS as the view engine
app.use(express.static("public"));

const port = process.env.PORT;
const SHOPIFY_API_KEY = process.env.CLIENT_ID;
const SHOPIFY_API_SECRET = process.env.CLIENT_SECRET;
const uri = "http://localhost:3000";
const REDIRECT_URI = `${uri}/shopify/callback`;
let myShop = process.env.SHOP_DOMAIN;
const SCOPES = "read_products,read_customers,read_orders"; // Add the scopes your app needs

app.get("/", (req, res) => {
  res.render("index");
});

// app.post('/login', (req, res) => {
//   myShop = req.body.myShop;
//   res.redirect('http://localhost:3000/login/shopify')
// });

// app.get('/login/index',(req,res)=>{
//   res.render('index');
// })
app.get("/login/shopify", (req, res) => {
  myShop = req.query.domain;
  const authUrl = `https://${myShop}/admin/oauth/authorize?client_id=${SHOPIFY_API_KEY}&redirect_uri=${REDIRECT_URI}&scope=${SCOPES}`;
  res.redirect(authUrl);
});

app.get("/shopify/callback", async (req, res) => {
  const { code, shop } = req.query;

  const tokenResponse = await axios.post(
    `https://${shop}/admin/oauth/access_token`,
    {
      client_id: SHOPIFY_API_KEY,
      client_secret: SHOPIFY_API_SECRET,
      code: code,
    }
  );

  const accessToken = tokenResponse.data.access_token;

  axios
    .get(`https://${shop}/admin/api/2023-07/products.json`, {
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
    })
    .then((response) => {
      console.log(response.data);
      res.send(response.data);
    })
    .catch((error) => {
      console.error("Error fetching customer information:", error);
    });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
