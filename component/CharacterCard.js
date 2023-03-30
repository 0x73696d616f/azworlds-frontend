import styles from './CharacterCard.module.css';

const CharacterCard = ({ character }) => {
  character.buyPrice = character.buyPrice / 1e18;

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <img src={character.img}/>
      </div>
      <div className={styles.details}>
        <div className={styles.name}>{character.charId}</div>
        <div className={styles.stats}>
          <div>Level: {character.level}</div>
          <div>Power: {character.power}</div>
          <div>Buy Price: {character.buyPrice}</div>
          <ul>
            {character.equippedItems.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
         <div>Equipped Gold: {character.equippedGold}</div>
         <div>Metadata CID: {character.url}</div>
         <div>Character Owner: {character.owner}</div>
        </div>
      </div>
    </div>
  );
};

export default CharacterCard;