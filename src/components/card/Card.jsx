import Image from "next/image";
import styles from "./card.module.css";
import Link from "next/link";

const Card = ({ key, cardLink, image, date, category, title, description}) => {
  return (
    <div className={styles.container} key={key}>
        <div className={styles.imageContainer}>
            {
                image?
                    <Image src={image} alt="" fill className={styles.image}/>
                    : <></>

            }
        </div>
        <div className={styles.textContainer}>
            <div className={styles.details}>
                <span className={styles.date}>{date} - </span>
                <span className={styles.category}>{category}</span>
            </div>
            <Link href={cardLink}>
                <h1>{title}</h1>
            </Link>
                <p className={styles.desc}>
                    {description}
                </p>
            <Link href={cardLink} className={styles.link}>Read More</Link>

        </div>
    </div>
  )
}

export default Card