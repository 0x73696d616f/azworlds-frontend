import Layout from "../component/layout";
import { Text } from "@nextui-org/react";
import styles from "../component/index.module.css";
import { useState, useEffect } from "react";

const Index = () => {
  const [charId, setCharId] = useState({});

  return (
    <>
    <div className={styles.bgWrap}>
      <Layout setCharId></Layout>
      </div>
    </>
  );
};

export default Index;
