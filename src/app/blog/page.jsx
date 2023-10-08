import CardList from "@/components/cardList/CardList";
import styles from "./blogPage.module.css";
import Menu from "@/components/menu/Menu";

{/* <div className={styles.container}>
<h1 className={styles.title} style={{ background: color }}>{title}</h1>
<div className={styles.content}>
    <CardList />
    <Menu />
</div>
</div> */}

const BlogPage = () => {
  return (
    <div className={styles.container}>
        <h1 className={styles.title} style={{ background: "#ffc353" }}>Things Blog</h1>
        <div className={styles.content}>
            <CardList />
            <Menu />
        </div>
    </div>
  )
}

export default BlogPage