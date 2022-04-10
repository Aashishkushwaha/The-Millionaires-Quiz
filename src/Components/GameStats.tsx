import React, { useEffect, useState } from "react";
import { Redirect } from "react-router-dom";
import { ENV_VARS, getFromLocalStorage, showToast } from "../utils/utils";
import "../styles/GameStats.css";
import axios from "axios";
import Loader from "./Loader";
import useLogout from "../hooks/useLogout";
import { useHistory } from "react-router-dom";

type GameStatsProps = {
  logoutClickHandler: () => void;
};

const GameStats: React.FC<GameStatsProps> = ({ logoutClickHandler }) => {
  const token = getFromLocalStorage(`${ENV_VARS.APP_NAME}_token`);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { logout } = useLogout();
  const history = useHistory();

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data } = await axios.get(
          "https://tmq-backend.herokuapp.com/game/getStats",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setStats(data?.details);
      } catch (error: any) {
        if (error?.response?.data?.code === 401) showToast("Session expired!");
        logout();
      } finally {
        setLoading(false);
      }
    };
    token && loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!token) return <Redirect to="/login" />;

  if (loading) return <Loader />;

  return (
    <>
      {token && (
        <button className="logout__button" onClick={logoutClickHandler}>
          Logout
        </button>
      )}
      <button
        style={{ margin: "1rem 0" }}
        onClick={() => history.push("/init_game")}
        className="go__to__home"
      >
        Go to Home
      </button>
      {stats && (
        <table className="game-stats__container">
          <thead>
            <tr>
              <th>Contestant Name</th>
              <th>Prize Won</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {Boolean(stats?.length) &&
              stats.slice(0, 50).map((stat: any) => (
                <tr key={stat._id}>
                  <td>{stat.contestantName}</td>
                  <td>{`₹ ${stat.prizeEarned}`}</td>
                  <td>{`${new Date(stat.time).toLocaleDateString()} ${new Date(
                    stat.time
                  ).toLocaleTimeString()}`}</td>
                </tr>
              ))}
            {!Boolean(stats?.length) && (
              <tr>
                <td className="empty__stats" colSpan={3}>
                  No stats found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </>
  );
};

export default GameStats;
