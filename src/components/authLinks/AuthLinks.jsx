import React from 'react';
import styles from "./authLinks.module.css";
import Link from 'next/link';


const AuthLinks = () => {
  const status = "not authenticated";

  return (
    <>
      {status === "not authenticated" ? (
        <Link href="/login">Login</Link>
      ) : (
        <>
          <Link href="/write">Write</Link>
          <span>Logout</span>
        </>
      )}
    </>
  )
}

export default AuthLinks