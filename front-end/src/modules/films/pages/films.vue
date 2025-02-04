<template>
  <InnerPage title="Catálogo">
    <DataTable 
      :header
      :items="films"
      :metadata
      :has-filters-label="true"
      :filters-label="filtersLabels"
      @apply-filters="(inputValues:FilterLabel[], newPage:number, sortByAppleid: any, rows:number) => findAll(inputValues, newPage, sortByAppleid, rows)"
      :sortBy
    ></DataTable>
  </InnerPage>
</template>

<script setup lang="ts">
  import type { FilterLabel, Header, Metadata } from '@/components/DataTable.vue';
  import { useFilmsStore } from '../store';

  const filmsStore = useFilmsStore();
  const films = ref<{
    _id: string,
    title: string,
    type: string,
    averageRating: string,
    genres: string,
    numVotes: number,
    releaseYear: string,
    createdAt: string,
    updatedAt: string,
  }[]>([])
  const metadata = ref<Metadata>({} as Metadata)
  const header = ref<Header[]>([
    {
      placing: 0,
      title: "Título",
      value: 'title',
      sortable: true,
      key: 'title'
    },
    {
      placing: 1,
      title: "Tipo",
      value: 'type',
      key: 'type',
      sortable: false,
    },
    {
      placing: 2,
      title: "Nota Média",
      value: 'averageRating',
      key: 'averageRating',
      sortable: false
    },
    {
      placing: 3,
      title: "Categoria",
      value: 'genres',
      key: 'genres',
      sortable: false,
    },
    {
      placing: 4,
      title: "Votos",
      value: 'numVotes',
      key: 'numVotes',
      sortable: false
    },
    {
      placing: 5,
      title: "Ano de Lançamento",
      value:'releaseYear',
      sortable: true,
      key:'releaseYear'
    }
  ])
  const filtersLabels = ref<FilterLabel[]>([
    {
      label: 'Título',
      componentType: 'textField',
      inputValue: null
    },
    {
      label: 'Categoria',
      componentType: 'comboBox',
      items: [
        "Action",
        "Adventure",
        "Animation",
        "Biography",
        "Comedy",
        "Crime",
        "Documentary",
        "Drama",
        "Family",
        "Fantasy",
        "Film-Noir",
        "Game-Show",
        "History",
        "Horror",
        "Music",
        "Musical",
        "Mystery",
        "News",
        "Reality-TV",
        "Romance",
        "Sci-Fi",
        "Short",
        "Sport",
        "Talk-Show",
        "Thriller",
        "War",
        "Western"
      ],
      inputValue: null
    },
    {
      label: 'Tipo',
      componentType: 'comboBox',
      items: ['Filme', 'Série'],
      inputValue: null
    }
  ])
  const sortBy = ref<{
    key: string,
    order: 'asc' | 'desc',
  }[]>([])
  
  async function findAll(inputValues?:FilterLabel[], page?:number, sortByAppleid?:any, rows?:number) {
    let params: Record<string, any> = {}

    // Formatando parametros de filtragem para a requisição
    if (inputValues) {
      if (inputValues[0].inputValue) params.title = inputValues[0].inputValue
      if (inputValues[1].inputValue) params.genres = inputValues[1].inputValue
      if (inputValues[2].inputValue) params.type = inputValues[2].inputValue == "Filme" ? 'movie' : 'tvSeries'
    }

    // Formatando parametros de ordenação para a requisição
    if (sortByAppleid && sortByAppleid[0]) {
      params.sortBy = sortByAppleid[0].key
      params.sortOrder = sortByAppleid[0].order
    }

    if (rows) params.rows = rows

    const result = await filmsStore.findAll({
      page: page || 1,
     ...params,
    });
    films.value = result.data.data;
    metadata.value = result.data.metadata;
  }

  onMounted(async () => {
    await findAll();
  })
</script>