import React from 'react';
import styles from "./cardList.module.css";
import Pagination from '../pagination/Pagination';
import Card from '../card/Card';

const getData = async (page) => {
  const res = await fetch(`http://localhost:3000/api/posts?page=${page}`, { cache: 'force-cache' });

  if (!res.ok) {
    throw new Error ("Failed recieving posts")
  }
  return res.json();
}

const CardList = async ({ page }) => {

  const { posts } = await getData(page);
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Recent Posts</h1>
      <div className={styles.posts}>
        {
          posts.map(item => (
            <Card 
              key={item._id}
              cardLink={"/"}
              image={item.img ? item.img : "" } 
              date={item.date} 
              category={item.category} 
              title={item.title} 
              description={item.desc} 
            />
          ))
        }
        {/* <Card 
          cardLink={"/"}
          image={'/p1.jpeg'} 
          date={'11.02.2023'} 
          category={'life'} 
          title={'Goose'} 
          description={`
            This is your 
            chance to discover goose culture and quack out those riddles 
            in the town of roost island. Try out a bonus cruise expedition 
            our sea at a reduce price at your visit order online@goose.quack_ie. 
            With your enthusiasm we will look forward to introducing you to our 
            beautiful, historical island. Enjoy some refreshers at your arrival.
          `} 
        />
        <Card 
          cardLink={"/"}
          image={'/p1.jpeg'} 
          date={'11.02.2023'} 
          category={'life'} 
          title={'Goose'} 
          description={`
            This is your 
            chance to discover goose culture and quack out those riddles 
            in the town of roost island. Try out a bonus cruise expedition 
            our sea at a reduce price at your visit order online@goose.quack_ie. 
            With your enthusiasm we will look forward to introducing you to our 
            beautiful, historical island. Enjoy some refreshers at your arrival.
          `} 
        />
        <Card 
          cardLink={"/"}
          image={'/p1.jpeg'} 
          date={'11.02.2023'} 
          category={'life'} 
          title={'Goose'} 
          description={`
            This is your 
            chance to discover goose culture and quack out those riddles 
            in the town of roost island. Try out a bonus cruise expedition 
            our sea at a reduce price at your visit order online@goose.quack_ie. 
            With your enthusiasm we will look forward to introducing you to our 
            beautiful, historical island. Enjoy some refreshers at your arrival.
          `} 
        />
        <Card 
          cardLink={"/"}
          image={'/p1.jpeg'} 
          date={'11.02.2023'} 
          category={'life'} 
          title={'Goose'} 
          description={`
            This is your 
            chance to discover goose culture and quack out those riddles 
            in the town of roost island. Try out a bonus cruise expedition 
            our sea at a reduce price at your visit order online@goose.quack_ie. 
            With your enthusiasm we will look forward to introducing you to our 
            beautiful, historical island. Enjoy some refreshers at your arrival.
          `} 
        /> */}
      </div>
      <Pagination page={page} count={posts} />
    </div>
  )
}

export default CardList