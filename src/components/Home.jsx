// src/pages/Home.jsx
import { useEffect, useState } from "react";

import '../styles/Home.css';

const API = "https://jsonplaceholder.typicode.com/users";

const Home = () =>
{
  const [users, setUsers] = useState([]);

  const fetchUsers = async(url) =>
  {
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.length > 0) {
        setUsers(data);
      }
      console.log(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }


  useEffect(() => {
    fetchUsers(API);
  }, []);

  return <>

    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Address</th>
        </tr>
      </thead>
      <tbody>
        {
          users.map(user => {
            const {id, name, email, address} = user;
            const {street, city, zipcode} = address;
            return (
            <tr key={id}>
              <td>{id}</td>
              <td>{name}</td>
              <td>{email}</td>
              <td>{`${street}, ${city}, ${zipcode}`}</td>
            </tr>
            )
          })}
      </tbody>
    </table>
  </>
}

export default Home;