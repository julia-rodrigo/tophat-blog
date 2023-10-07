import Image from "next/image";
import styles from "./card.module.css";
import Link from "next/link";

const Card = () => {
  return (
    <div className={styles.container}>
        <div className={styles.imageContainer}>
            <Image src="/p1.jpeg" alt="" fill className={styles.image}/>
        </div>
        <div className={styles.textContainer}>
            <div className={styles.details}>
                <span className={styles.date}>11.02.2023 - </span>
                <span className={styles.category}>CULTURE</span>
            </div>
            <Link href="/">
                <h1>Goose</h1>
            </Link>
                <p className={styles.desc}>
                {/* Customise your goose and have it running on your screen
                    on startup. Super cute, interesting and fun.  */}
                    This is your 
                    chance to discover goose culture and quack out those riddles 
                    in the town of roost island. Try out a bonus cruise expedition 
                    our sea at a reduce price at your visit order online@goose.quack_ie. 
                    With your enthusiasm we will look forward to introducing you to our 
                    beautiful, historical island. Enjoy some refreshers at your arrival.
                </p>

            <Link href="/" className={styles.link}>Read More</Link>

        </div>
    </div>
  )
}

export default Card