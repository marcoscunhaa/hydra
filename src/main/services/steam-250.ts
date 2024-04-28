import axios from "axios";
import { JSDOM } from "jsdom";

export interface Steam250Game {
  title: string;
  objectID: string;
}

export const requestSteam250 = async (path: string) => {
  return axios
    .get(`https://steam250.com${path}`)
    .then((response) => {
      const { window } = new JSDOM(response.data);
      const { document } = window;

      return Array.from(document.querySelectorAll(".appline .title a"))
        .map(($title: HTMLAnchorElement) => {
          const steamGameUrl = $title.href;
          if (!steamGameUrl) return null;

          return {
            title: $title.textContent,
            objectID: steamGameUrl.split("/").pop(),
          } as Steam250Game;
        })
        .filter((game) => game != null);
    })
    .catch((_) => []);
};

const steam250Paths = [
  "/hidden_gems",
  `/${new Date().getFullYear()}`,
  "/top250",
  "/most_played",
];

export const getSteam250List = async () => {
  const gamesPromises = steam250Paths.map((path) => requestSteam250(path));
  const gamesList = (await Promise.all(gamesPromises)).flat();

  const gamesMap: Map<string, Steam250Game> = gamesList.reduce((map, item) => {
    map.set(item.objectID, item);
    return map;
  }, new Map());

  return [...gamesMap.values()];
};
