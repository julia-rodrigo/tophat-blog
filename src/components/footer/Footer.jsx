import React from 'react';
import styles from "./footer.module.css";
import Image from 'next/image';
import Link from 'next/link';

const Footer = () => {
  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <div className={styles.logo}>
          <Image src="/logo.png" alt="tophat_blog" width={50} height={50}/>
          <h1 className={styles.logoText}>TopHat Blog</h1>
        </div>
        <p className={styles.description}>
          To truly know someone, let them use your internet for an hour.
          Then turn off the internet and observe deeply with keen interest. 
          With a table flip, the truth shalth be revealed.
        </p>
        <div className={styles.icons}>
          <Image src="/facebook.png" alt="facebook" width={18} height={18} />
          <Image src="/instagram.png" alt="instagram" width={18} height={18} />
          <Image src="/tiktok.png" alt="tiktok" width={18} height={18} />
          <Image src="/youtube.png" alt="youtube" width={18} height={18} />
        </div>
      </div>
      <div className={styles.links}>
        <div className={styles.list}>
          <span className={styles.listTitle}>Links</span>
          <Link href="/">Homepage</Link>
          <Link href="/">Blog</Link>
          <Link href="/">About</Link>
          <Link href="/">Contact</Link>
        </div>
        <div className={styles.list}>
          <span className={styles.listTitle}>Tags</span>
          <Link href="/">Coding</Link>
          <Link href="/">Animation</Link>
          <Link href="/">Games</Link>
          <Link href="/">Ideas</Link>
        </div>
        <div className={styles.list}>
          <span className={styles.listTitle}>Social</span>
          <Link href="/">facebook</Link>
          <Link href="/">instagram</Link>
          <Link href="/">tiktok</Link>
          <Link href="/">YouTube</Link>
        </div>
      </div>
    </div>
  )
}

export default Footer