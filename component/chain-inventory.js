import React from 'react';
import { Table } from "@nextui-org/react";

const ChainInventory = ({ addressInfo }) => {
    return (<Table
        color="warning"
        aria-label="Items"
        css={{
            height: "auto",
            minWidth: "100%",
        }}
    >
        <Table.Header>
            <Table.Column>ItemId</Table.Column>
            <Table.Column>Amount</Table.Column>
            <Table.Column>Chain</Table.Column>
        </Table.Header>
        <Table.Body>
            {Object.entries(addressInfo[0].itemIds).filter((itemAmount) => itemAmount[1] !== "0").map((itemAmount, index) => (
                <Table.Row key={index}>
                    <Table.Cell>{itemAmount[0]}</Table.Cell>
                    <Table.Cell>{itemAmount[1]}</Table.Cell>
                    <Table.Cell>{addressInfo[0].chain}</Table.Cell>
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
    </Table>);
}

export default ChainInventory;