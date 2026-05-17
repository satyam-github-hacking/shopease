export default function App() {
  return (
    <div style={{padding:"40px",fontFamily:"Arial"}}>
      <h1>Modern E-Commerce Platform</h1>

      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(3,1fr)",
        gap:"20px",
        marginTop:"30px"
      }}>

        <div style={{border:"1px solid #ddd",padding:"20px"}}>
          <h2>Authentication</h2>
          <p>JWT Based Login/Register</p>
        </div>

        <div style={{border:"1px solid #ddd",padding:"20px"}}>
          <h2>Products</h2>
          <p>Categories, Brands, Inventory</p>
        </div>

        <div style={{border:"1px solid #ddd",padding:"20px"}}>
          <h2>Orders</h2>
          <p>Tracking and Checkout</p>
        </div>

        <div style={{border:"1px solid #ddd",padding:"20px"}}>
          <h2>Reviews</h2>
          <p>Ratings and Comments</p>
        </div>

        <div style={{border:"1px solid #ddd",padding:"20px"}}>
          <h2>Analytics</h2>
          <p>Revenue Dashboard</p>
        </div>

        <div style={{border:"1px solid #ddd",padding:"20px"}}>
          <h2>AI Features</h2>
          <p>Recommendations and Smart Search</p>
        </div>

      </div>
    </div>
  )
}