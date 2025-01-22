<template>
  <InnerPage title="Filmes">
    <DataTable 
      :header
      :items="films"
      :metadata
      v-model:current-page="currentPage"
      :has-filters-label="true"
      :filters-label="filtersLabels"
      v-model:title-filter="titleFilter"
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
      title: "Gêneros",
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
  const filtersLabels = ref<FilterLabel[]>([
    {
      label: 'Título',
      componentType: 'textField',
      inputValue: null
    },
    {
      label: 'Categoria',
      componentType: 'comboBox',
      items: []
    }
  ])
  const currentPage = ref<number>(1)
  const titleFilter = ref('')

  async function findAll() {
    const result = await filmsStore.findAll({
      page: currentPage.value,
      title: titleFilter.value
    });
    films.value = result.data.data;
    metadata.value = result.data.metadata;
    console.log(result.data);
  }

  onMounted(async () => {
    await findAll();
  })
  watch(currentPage, async () => await findAll())
  watch(titleFilter, async () => await findAll())
</script>