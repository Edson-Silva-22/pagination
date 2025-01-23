<template>
  <InnerPage title="Filmes">
    <DataTable 
      :header
      :items="films"
      :metadata
      v-model:current-page="currentPage"
      :has-filters-label="true"
      :filters-label="filtersLabels"
      @apply-filters="(inputValues:FilterLabel[]) => findAll(inputValues)"
    ></DataTable>
  </InnerPage>
</template>

<script setup lang="ts">
  import type { FilterLabel, Metadata } from '@/components/DataTable.vue';
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
  const header = [
    {
      title: "Título",
      value: 'title'
    },
    {
      title: "Tipo",
      key: 'type',
    },
    {
      title: "Nota Média",
      value: 'averageRating'
    },
    {
      title: "Categoria",
      value: 'genres'
    },
    {
      title: "Votos",
      value: 'numVotes'
    },
    {
      title: "Ano de Lançamento",
      value:'releaseYear'
    }
  ]
  const currentPage = ref<number>(1)
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
  

  async function findAll(inputValues?:FilterLabel[]) {
    let params = {}

    // Formatando parametros para a requisição
    if (inputValues) {
      params = {
        ...(inputValues[0].inputValue && { title: inputValues[0].inputValue }),
        ...(inputValues[1].inputValue && { genres: inputValues[1].inputValue }),
        ...(inputValues[2].inputValue && { type: inputValues[2].inputValue == "Filme" ? 'movie' : 'tvSeries' }),
      }
    }

    const result = await filmsStore.findAll({
      page: currentPage.value,
      ...params
    });
    films.value = result.data.data;
    metadata.value = result.data.metadata;
  }

  onMounted(async () => {
    await findAll();
  })
  watch(currentPage, async () => await findAll())
</script>