import styles from "../styles/Card.module.scss"

export default function Card({ title, children }) {
    return (
        <div className="card mat-elevation-z4">
            <h5 className={styles.cardTitle}>{title}</h5>
            <div className={styles.content}>
                {children}
            </div>
        </div>
    );
}