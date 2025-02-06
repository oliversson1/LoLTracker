import React, { useEffect, useState } from "react";
import axios from "axios";

function ChampionsList() {
    const [champions, setChampions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    useEffect(() => {
        async function fetchChampions() {
            try {
                const response = await axios.get(
                    "https://ddragon.leagueoflegends.com/cdn/13.21.1/data/en_US/champion.json"
                );
                const data = response.data.data;
                const championsArray = Object.values(data);
                setChampions(championsArray);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching champions from Data Dragon:", err);
                setError("Error loading champions from Data Dragon.");
                setLoading(false);
            }
        }

        fetchChampions();
    }, []);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentChampions = champions.slice(startIndex, endIndex);

    const totalPages = Math.ceil(champions.length / itemsPerPage);

    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage((prev) => prev + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage((prev) => prev - 1);
        }
    };

    if (loading) return <p>Loading champions...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="championsContainer">
            <ul className="championList">
                {currentChampions.map((champion) => (
                    <li key={champion.id} className="championItem">
                        <img
                            src={`https://ddragon.leagueoflegends.com/cdn/13.21.1/img/champion/${champion.id}.png`}
                            alt={champion.name}
                            className="championImage"
                        />
                        <div>
                            <strong>{champion.name}</strong>
                        </div>
                    </li>
                ))}
            </ul>

            <div className="paginationControls">
                <button onClick={prevPage} disabled={currentPage === 1}>
                    Previous
                </button>
                <span>
                    Page {currentPage} of {totalPages}
                </span>
                <button onClick={nextPage} disabled={currentPage === totalPages}>
                    Next
                </button>
            </div>
        </div>
    );
}

export default ChampionsList;
