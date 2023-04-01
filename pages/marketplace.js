import Layout from "../component/layout";
import { Table, Grid, Button, Textarea, Col, Row } from "@nextui-org/react";
import styles from "../component/marketplace.module.css";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import abi from "../contracts/Marketplace.json";

const Marketplace = () => {
    const [charId, setCharId] = useState({});
    const [sellOrders, setSellOrders] = useState([{}]);
    const [buyOrders, setBuyOrders] = useState([{}]);
    const [selectedSellOrders, setSelectedSellOrders] = useState([]);
    const [selectedBuyOrders, setSelectedBuyOrders] = useState([]);
    const [placeSellOrders, setPlaceSellOrders] = useState([]);
    const [placeBuyOrders, setPlaceBuyOrders] = useState([]);

    const marketplaceAddress="0x59d4E5d8935cBD32b4ab663E06EAF18208Ae4BD5";

    const parsePlaceSellOrders = (e) => {
        try {
        setPlaceSellOrders(JSON.parse(e.target.value));
        } catch (e) {
            alert(e);
            setPlaceSellOrders([]);
        }
    }

    const parsePlaceBuyOrders = (e) => {
        try {
        setPlaceBuyOrders(JSON.parse(e.target.value));
        } catch (e) {
            alert(e);
            setPlaceBuyOrders([]);
        }
    }

    let sellOrdersMapping = {};
    let buyOrdersMapping = {};

    const fullfillOrders = async () => {
        if (typeof window.ethereum === "undefined") return;
        updateVars();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const marketplace = new ethers.Contract(marketplaceAddress, abi, signer);
        const selectedSellOrdersFixed = selectedSellOrders.map((key) => sellOrdersMapping[key]);
        const selectedBuyOrdersFixed = selectedBuyOrders.map((key) => buyOrdersMapping[key]);
        console.log(selectedSellOrders);
        console.log(selectedSellOrdersFixed);
        const tx = await marketplace.fulfilOrders(selectedSellOrdersFixed, selectedBuyOrdersFixed);
        await tx.wait();
    }

    const placeMarketplaceOrders = async () => {
        if (typeof window === "undefined") return;
        updateVars();
        let placeSellOrdersIds = [];
        let placeBuyOrdersIds = [];
        let placeSellOrdersPrices = [];
        let placeBuyOrdersPrices = [];
        for(let i = 0; i < placeSellOrders.length; i++) {
            placeSellOrdersIds.push(placeSellOrders[i].itemId.toString());
            placeSellOrdersPrices.push(placeSellOrders[i].price.toString());
        }
        for(let i = 0; i < placeBuyOrders.length; i++) {
            placeBuyOrdersIds.push(placeBuyOrders[i].itemId);
            placeBuyOrdersPrices.push(placeBuyOrders[i].price);
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const marketplace = new ethers.Contract(marketplaceAddress, abi, signer);

        const tx = await marketplace.placeOrders(placeSellOrdersIds, placeSellOrdersPrices, placeBuyOrdersIds, placeBuyOrdersPrices);
        await tx.wait();
    }

    const cancelOrders = async () => {
        if (typeof window === "undefined") return;
        updateVars();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const marketplace = new ethers.Contract(marketplaceAddress, abi, signer);
        console.log(selectedSellOrders, selectedBuyOrders);
        const tx = await marketplace.cancelOrders(selectedSellOrders, selectedBuyOrders);
        await tx.wait();
    }

    const updateVars = async () => {
        if (typeof window === undefined) return;
        const accounts = await ethereum.request({ method: "eth_accounts" });
        if (accounts.length <= 0) return;
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const marketplace = new ethers.Contract(marketplaceAddress, abi, signer);
        const currSellOrders = await marketplace.getSellOrders();
        const currBuyOrders = await marketplace.getBuyOrders();
        let fixedSellOrders = [];
        let fixedBuyOrders = [];
        for (let i = 0; i < currSellOrders.length; i++) {
            if (currSellOrders[i].itemId === 0) continue;
            sellOrdersMapping[fixedSellOrders.length] = i;
            fixedSellOrders.push({
                seller: currSellOrders[i].seller.slice(0, 6) + "..." + currSellOrders[i].seller.slice(-4),
                itemId: currSellOrders[i].itemId,
                price: currSellOrders[i].price.toString()
            })
        }

        for (let i = 0; i < currBuyOrders.length; i++) {   
            if (currBuyOrders[i].itemId === 0) continue;
            buyOrdersMapping[fixedBuyOrders.length] = i;
            fixedBuyOrders.push({
                buyer: currBuyOrders[i].buyer.slice(0, 6) + "..." + currBuyOrders[i].buyer.slice(-4),
                itemId: currBuyOrders[i].itemId,
                price: currBuyOrders[i].price.toString()
            })
        }

        setSellOrders(fixedSellOrders);
        setBuyOrders(fixedBuyOrders);
        return marketplace;
    }

    useEffect(() => {
        updateVars();
    }, [])

    return (
        <>
            <div className={styles.bgWrap}>
                <Layout setCharId={setCharId}></Layout>
                <Grid.Container justifyContent="center" alignItems="center">
                    <Row>
                        <Col>
                            <Table
                                color="warning"
                                aria-label="Sell Orders"
                                css={{
                                    height: "auto",
                                    minWidth: "100%",
                                }}
                                selectionMode="multiple"
                                onSelectionChange={(selectedRows) => {
                                    console.log([...selectedRows]);
                                    //setSelectedSellOrders(selectedRows.keys());
                                }}
                            >
                                <Table.Header>
                                    <Table.Column>Seller</Table.Column>
                                    <Table.Column>ItemId</Table.Column>
                                    <Table.Column>Price Gold</Table.Column>
                                </Table.Header>
                                <Table.Body>
                                    {sellOrders.map((order, index) => (
                                        <Table.Row key={index}>
                                            <Table.Cell>{order.seller}</Table.Cell>
                                            <Table.Cell>{order.itemId}</Table.Cell>
                                            <Table.Cell>{order.price}</Table.Cell>
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                                <Table.Pagination
                                    shadow
                                    noMargin
                                    align="center"
                                    rowsPerPage={6}
                                    onPageChange={(page) => console.log({ page })}
                                />
                            </Table>
                        </Col>
                        <Col>
                            <Table
                                color="warning"
                                aria-label="Buy Orders"
                                css={{
                                    height: "auto",
                                    minWidth: "100%",
                                }}
                                selectionMode="multiple"
                                onSelectionChange={(selectedRows) => {
                                    setSelectedBuyOrders(selectedRows.keys());
                                }}
                            >
                                <Table.Header>
                                    <Table.Column>Buyer</Table.Column>
                                    <Table.Column>ItemId</Table.Column>
                                    <Table.Column>Price USD</Table.Column>
                                </Table.Header>
                                <Table.Body>
                                    {buyOrders.map((order, index) => (
                                        <Table.Row key={index}>
                                            <Table.Cell>{order.buyer}</Table.Cell>
                                            <Table.Cell>{order.itemId}</Table.Cell>
                                            <Table.Cell>{order.price}</Table.Cell>
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                                <Table.Pagination
                                    shadow
                                    noMargin
                                    align="center"
                                    rowsPerPage={6}
                                    onPageChange={(page) => console.log({ page })}
                                />
                            </Table>
                        </Col>
                        <Col>
                            <Textarea className={styles.text}
                                label="Place Sell Orders"
                                placeholder='[{"itemId": "1", "price": "2"}]'
                                initialValue='[{"itemId": "1", "price": "2"}]'
                                onBlur={parsePlaceSellOrders}
                            />
                        </Col>
                        <Col>
                            <Textarea className={styles.text}
                                label="Place Buy Orders"
                                placeholder='[{"itemId": "1", "price": "2"}]'
                                initialValue='[{"itemId": "1", "price": "2"}]'
                                onBlur={parsePlaceBuyOrders}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Button auto color="warning" onClick={fullfillOrders}>Fullfill Orders</Button>
                        </Col>
                        <Col>
   
                            <Button auto color="warning" onClick={cancelOrders}>Cancel Orders</Button>

                        </Col>
                        <Col>
                            <Button auto color="warning" onClick={placeMarketplaceOrders}>PlaceOrders</Button>
                        </Col>
                        <Col>
                        </Col>
                    </Row>
                </Grid.Container>
            </div>
        </>
    );
};

export default Marketplace;
