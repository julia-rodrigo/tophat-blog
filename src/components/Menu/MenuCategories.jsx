import Link from 'next/link'
import React from 'react'
import styles from "./menu.module.css";

const MenuCategories = ({ catLink, color, categoryName}) => {
  return (
    <Link href={catLink} className={`${styles.categoryItem}`} style={{ background: color}}>
        {categoryName}
    </Link>
  )
}

export default MenuCategories