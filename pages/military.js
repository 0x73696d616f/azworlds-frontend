import Layout from "../component/layout";
import { Text } from "@nextui-org/react";
import styles from "../component/index.module.css";
import { useState, useEffect } from "react";

const Military = () => {
  const [charId, setCharId] = useState({});

  return (
    <>
    <div className={styles.bgWrap}>
      <Layout setCharId={setCharId}></Layout>
      </div>
    </>
  );
};

export default Military;
