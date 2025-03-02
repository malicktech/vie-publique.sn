import type { Coalition } from "~/types/coalition";

export const useCoalitions = (
  coalitionId?: string | null,
  ranking?: boolean,
) => {
  console.debug("useCoalitions");
  const config = useRuntimeConfig();

  // Détermine l'URL en fonction de la présence d'un `coalitionId`
  // head_of_list.first_name,head_of_list.last_name
  const detailsFields = `fields=name,logo,list_order,bulletin,videos.date,videos.url_youtube`;
  const listFields = `fields=id,name,logo,list_order,bulletin,head_of_list.photo,head_of_list.first_name,head_of_list.last_name`;
  const listFieldsRanking = `fields=id,name,logo,list_order,bulletin,voix,pourcentage,sieges,sieges_departement,head_of_list.photo,head_of_list.first_name,head_of_list.last_name`;
  const rankingSort = `sort:-voix`;
  const videoSort = `sort:-videos.date`;
  const apiUrl = coalitionId
    ? `${config.public.cmsApiUrl}/items/election_coalition/${coalitionId}?${detailsFields}&${videoSort}`
    : ranking
      ? `${config.public.cmsApiUrl}/items/election_coalition?sort=list_order&${listFieldsRanking}&${rankingSort}`
      : `${config.public.cmsApiUrl}/items/election_coalition?sort=list_order&${listFields}`;

  return useAsyncData(
    `coalitions${coalitionId ? `-${coalitionId}` : ""}`,
    () =>
      $fetch<{ data: Coalition[] | Coalition }>(apiUrl, {
        params: {
          filter: { status: "published" },
        },
        headers: {
          Authorization: `Bearer ${config.public.cmsApiKey}`,
        },
      }),
    {
      transform: (response) => response.data,
      server: true,
      lazy: false,
    },
  );
};
