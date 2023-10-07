import React from 'react';
import styles from "./menu.module.css";
import MenuLink from './MenuLink';
import MenuCategories from './MenuCategories';

const Menu = () => {
  return (
    <div className={styles.container}>
      <h2 className={styles.subtitle}>{"What's hot"}</h2>
      <h1 className={styles.title}>Most Popular</h1>
      <div className={styles.items}>
        <MenuLink 
          catLink={'/'} 
          color={'#57f9ff'} 
          category={'Ideas'} 
          title={'Customise your goose.'} 
          username={'poofy_desu'} 
          date={' - 10.03.2023'}
        />
        <MenuLink 
          catLink={'/'} 
          color={'#ffe657'} 
          category={'Life'} 
          title={'Super cute, interesting and fun. '} 
          username={'poofysama'} 
          date={' - 10.03.2023'}
        />
        <MenuLink 
          catLink={'/'} 
          color={'#ffab57'} 
          category={'Things'} 
          title={'Things to run on your screen on your laptop startup.'} 
          username={'poofychan'} 
          date={' - 10.03.2023'}
        />
        <MenuLink 
          catLink={'/'} 
          color={'#6b57ff'} 
          category={'Coding'} 
          title={'How to run Git'} 
          username={'atashi_poofy'} 
          date={' - 10.03.2023'}
        />
      </div>

      <h2 className={styles.subtitle}>Discover by Topic</h2>
      <h1 className={styles.title}>Categories</h1>
      <div className={styles.categoryList}>
      <MenuCategories catLink={'/blog?cat=coding'} color={'#6b57ff31'} categoryName={'Coding'} />
        <MenuCategories catLink={'/blog?cat=animation'} color={'#da85c731'} categoryName={'Animation'} />
        <MenuCategories catLink={'/blog?cat=games'} color={'#a8ff5731'} categoryName={'Games'} />
        <MenuCategories catLink={'/blog?cat=music'} color={'#57ffc431'} categoryName={'Music'} />
        <MenuCategories catLink={'/blog?cat=things'} color={'#ffab5731'} categoryName={'Things'} />

        {/* <MenuCategories catLink={'/blog?cat=coding'} color={'#6b57ff'} categoryName={'Coding'} />
        <MenuCategories catLink={'/blog?cat=animation'} color={'#da85c8'} categoryName={'Animation'} />
        <MenuCategories catLink={'/blog?cat=games'} color={'#a8ff57'} categoryName={'Games'} />
        <MenuCategories catLink={'/blog?cat=music'} color={'#57ffc4'} categoryName={'Music'} />
        <MenuCategories catLink={'/blog?cat=things'} color={'#ffab57'} categoryName={'Things'} /> */}
      </div>


      <h2 className={styles.subtitle}>Chosen by the editor</h2>
      <h1 className={styles.title}>Editor Picks</h1>
      <div className={styles.items}>
        <MenuLink 
          catLink={'/'} 
          image={'/p1.jpeg'} 
          color={'#57f9ff'} 
          category={'Ideas'} 
          title={'Customise your goose.'} 
          username={'poofy_desu'} 
          date={' - 10.03.2023'}
        />
        <MenuLink 
          catLink={'/'} 
          image={'/p1.jpeg'} 
          color={'#ffe657'} 
          category={'Life'} 
          title={'Super cute, interesting and fun. '} 
          username={'poofysama'} 
          date={' - 10.03.2023'}
        />
        <MenuLink 
          catLink={'/'} 
          image={'/p1.jpeg'} 
          color={'#ffab57'} 
          category={'Things'} 
          title={'Things to run on your screen on your laptop startup.'} 
          username={'poofychan'} 
          date={' - 10.03.2023'}
        />
        <MenuLink 
          catLink={'/'} 
          image={'/p1.jpeg'} 
          color={'#6b57ff'} 
          category={'Coding'} 
          title={'How to run Git'} 
          username={'atashi_poofy'} 
          date={' - 10.03.2023'}
        />
      </div>
    </div>
  )
}

export default Menu