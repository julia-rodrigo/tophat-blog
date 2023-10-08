import React from 'react'
import styles from './singlePage.module.css';
import Menu from '@/components/menu/Menu';
import Image from 'next/image';
import Comments from '@/components/comments/Comment';

const page = () => {
  return (
    <div className={styles.container}>
        <div className={styles.infoContainer}>
            <div className={styles.textContainer}>
                <h1 className={styles.title}>Alice in Wonderland, but with Shinobu and the travelling merchant</h1>
                <div className={styles.user}>
                    <div className={styles.userImageContainer}>
                        <Image src="/p1.jpeg" alt="" fill className={styles.avatar} />
                    </div>
                    <div className={styles.userTextContainer}>
                        <span className={styles.username}>poofy_original</span>
                        <span className={styles.date}>01.01.2023</span>
                    </div>
                </div>
            </div>
            <div className={styles.imageContainer}>
                <Image src="/p1.jpeg" alt="" fill className={styles.image} />
            </div>
        </div>
        <div className={styles.content}>
            <div className={styles.post}>
                <div className={styles.description}>
                    <p>
                        The once was a palace a long time ago.
                        The queen held roses of red and a heart of white
                        They call her the most beautiful in the kingdom
                        And when she passed, her photo stayed as an heirloom
                        to the most beloved person to ever exists
                    </p>
                    <p>
                        With a book that covetted the contract looked in a 
                        special forest and the key given to the left eye
                        that held the dark dragon, the descendance cannot 
                        compare to her exellences and so the power was thought to
                        be a lost cause.
                    </p>
                    <h2>
                        A person not too long ago was born with the hidden
                        right arm. WHo knows what story can be written into 
                        the fairytale of the noble-heart-underblade kingdom
                    </h2>
                </div>
                <div className={styles.comment}>
                    <Comments />
                </div>
            </div>
            <Menu />
        </div>
    </div>
  )
}

export default page