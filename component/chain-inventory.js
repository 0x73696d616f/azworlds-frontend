import React from 'react';
import { Table, Button, Grid, Spacer, Card, Dropdown, Input } from "@nextui-org/react";
import { useState, useEffect } from "react";
import itemsAbi from "../contracts/Item.json";
import goldAbi from "../contracts/Gold.json";
import characterAbi from "../contracts/CharacterSale.json";
import { ethers } from "ethers";

const ChainInventory = (props) => {
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectedGold, setSelectedGold] = useState(0);

    const sendItemsTo = async (index) => {
        props.setIsLoading(true);
        try {
            const { ethereum } = window;
            if (!ethereum) return;
            const accounts = await ethereum.request({ method: "eth_accounts" });
            if (accounts.length < 0) return;
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const signerAddress = await signer.getAddress();
            const itemAddress = process.env.NEXT_PUBLIC_ITEM;
            const item = new ethers.Contract(itemAddress, itemsAbi, signer);
            let chainId;
            if (index === "0") chainId = 10161 // Sepolia
            else if (index === "1") chainId = 10109  // Mumbai
            else throw("Invalid index");
            
            let itemIds = [];
            let amounts = [];
            const itemIdsEntries = Object.entries(props.addressInfo.itemIds);
            for (let i = 0; i < selectedItems.length; i++) {
                itemIds.push(itemIdsEntries[selectedItems[i]][0]);
                amounts.push(itemIdsEntries[selectedItems[i]][1]);
            }

            const tx = await item.sendBatchFrom(signerAddress, chainId, signerAddress, itemIds, amounts, signerAddress, ethers.constants.AddressZero, "0x", {value: ethers.utils.parseEther("0.1")});
            await tx.wait();
        }
        catch (err) {
            console.log(err);
        }
        props.setIsLoading(false);
    }

    const sendGoldTo = async (index) => {
        props.setIsLoading(true);
        try {
            const { ethereum } = window;
            if (!ethereum) return;
            const accounts = await ethereum.request({ method: "eth_accounts" });
            if (accounts.length < 0) return;
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const signerAddress = await signer.getAddress();
            const goldAddress = process.env.NEXT_PUBLIC_GOLD;
            const gold = new ethers.Contract(goldAddress, goldAbi, signer);
            let chainId;
            if (index === "0") chainId = 10161 // Sepolia
            else if (index === "1") chainId = 10109  // Mumbai
            else throw("Invalid index");

            const tx = await gold.sendFrom(signerAddress, chainId, signerAddress, selectedGold, signerAddress, ethers.constants.AddressZero, "0x", {value: ethers.utils.parseEther("0.1")});
            await tx.wait();
        }
        catch (err) {
            console.log(err);
        }
        props.setIsLoading(false);
    }

    const equipGold = async () => {
        props.setIsLoading(true);
        try {
            const { ethereum } = window;
            if (!ethereum) return;
            const accounts = await ethereum.request({ method: "eth_accounts" });
            if (accounts.length < 0) return;
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const characterSaleAddress = process.env.NEXT_PUBLIC_CHARACTER;
            const characterSale = new ethers.Contract(characterSaleAddress, characterAbi, signer);
            console.log(selectedGold);
            const tx = await characterSale.carryGold(props.charId, selectedGold);
            await tx.wait();
        } catch(err) {
            console.log(err);
        }
        props.setIsLoading(false);
    }

    const equipItems = async () => {
        props.setIsLoading(true);
        try {
            const { ethereum } = window;
            if (!ethereum) return;
            const accounts = await ethereum.request({ method: "eth_accounts" });
            if (accounts.length < 0) return;
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const characterSaleAddress = process.env.NEXT_PUBLIC_CHARACTER;
            const characterSale = new ethers.Contract(characterSaleAddress, characterAbi, signer);            
            let itemIds = [];
            const itemIdsEntries = Object.entries(props.addressInfo.itemIds);
            for (let i = 0; i < selectedItems.length; i++) {
                itemIds.push(itemIdsEntries[selectedItems[i]][0]);
            }
            console.log(props.addressInfo.itemIds);
            console.log("itemIds: " + itemIds);

            const tx = await characterSale.equipItems(props.charId, itemIds);
            await tx.wait();
        }
        catch (err) {
            console.log(err);
        }
        props.setIsLoading(false);
    }

    return (<Card>
        <Card.Body>
        <Input auto onChange={(e) => setSelectedGold(e.target.value)} label={"Max gold: " + props.addressInfo.gold} initialValue={props.addressInfo.gold}></Input>
        <Spacer y={0.5}/>
        <Grid.Container>
            < Dropdown>
            <Dropdown.Button auto color="warning">Send To Chain</Dropdown.Button>
            <Dropdown.Menu color="warning" aria-label="Static Actions" auto onAction={sendGoldTo}>
                {props.addressInfo.chain !== "Sepolia" && <Dropdown.Item key={0}>Sepolia</Dropdown.Item>}
                {props.addressInfo.chain !== "Mumbai" && <Dropdown.Item key={1}>Mumbai</Dropdown.Item>}
            </Dropdown.Menu>
            </Dropdown>
            <Spacer x={0.5}></Spacer>
            <Button auto color="warning" onClick={equipGold}>Equip Gold</Button>
        </Grid.Container>
        <Table
        color="warning"
        aria-label="Items"
        css={{
            height: "auto",
            minWidth: "100%",
        }}
        selectionMode="multiple"
        onSelectionChange={(selectedRows) => {
            if (selectedRows === 'all') setSelectedItems([...Array(Object.entries(props.addressInfo.itemIds).filter((itemAmount) => itemAmount[1] !== "0").length).keys()]);
            else setSelectedItems([...selectedRows]);
        }}
    >
        <Table.Header>
            <Table.Column>ItemId</Table.Column>
            <Table.Column>Amount</Table.Column>
            <Table.Column>Chain</Table.Column>
        </Table.Header>
        <Table.Body>
            {Object.entries(props.addressInfo.itemIds).filter((itemAmount) => itemAmount[1] !== "0").map((itemAmount, index) => (
                <Table.Row key={index}>
                    <Table.Cell>{itemAmount[0]}</Table.Cell>
                    <Table.Cell>{itemAmount[1]}</Table.Cell>
                    <Table.Cell>{props.addressInfo.chain}</Table.Cell>
                </Table.Row>
            ))}
        </Table.Body>
        <Table.Pagination
            shadow
            noMargin
            align="center"
            rowsPerPage={3}
            onPageChange={(page) => console.log({ page })}
        />
    </Table>
    <Spacer y={0.5}></Spacer>
    <Grid.Container>
    < Dropdown>
    <Dropdown.Button auto color="warning">Send To Chain</Dropdown.Button>
    <Dropdown.Menu color="warning" aria-label="Static Actions" auto onAction={sendItemsTo}>
        {props.addressInfo.chain !== "Sepolia" && <Dropdown.Item key={0}>Sepolia</Dropdown.Item>}
        {props.addressInfo.chain !== "Mumbai" && <Dropdown.Item key={1}>Mumbai</Dropdown.Item>}
    </Dropdown.Menu>
    </Dropdown>
    <Spacer x={0.5}></Spacer>
    <Button color="warning" auto onClick={equipItems}>Equip Items</Button>
    </Grid.Container>
    </Card.Body>
    </Card>
    );
}

export default ChainInventory;