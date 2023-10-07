import Link from "next/link";
import styles from "./homepage.module.css";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import Featured from "@/components/featured/Featured";
import CategoryList from "@/components/categoryList/CategoryList";
import CardList from "@/components/cardList/CardList";
import Menu from "@/components/Menu/Menu";
import Pagination from "@/components/Pagination/Pagination";

export default function Home() {
  return <div>
      
      <h1>this is tendo maya</h1>
      <br />
      <p>
        kagayaki chansu wa ubyoudo
        chinuite kurai e kyouenchi
        ai no jiyuu no haisha ni zaregoto
        tenjou tenge, yui ga dokkuko
        99kisei, Tendo Maya
        naraku de miagerou,
        watashi ga star daaa
      </p>
      <br />
      <p>
        Tsuki no kagayaki hoshi no ai
        Amata no hikari, atsumete ima
        Anata no kokoro ni todokemashou
        99kisei shuseki Tendo Maya
        Koyoi, hiramekiyo anatani
      </p>
      <br />

      <Featured />
      <CategoryList />
      <div className="styles.content">
        <CardList/>
        <Menu />
      </div>

  </div>;
}
