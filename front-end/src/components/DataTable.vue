<template>
  <v-data-table-server
    :headers="props.header"
    :items="props.items"
    :items-length="props.items.length"
  >
    <template v-slot:no-data>
      <span> <v-icon>mdi-emoticon-sad</v-icon> Nenhum registro foi encontrado </span>
    </template>

    <template v-slot:item.type="{ item }">
      <v-chip color="green">{{ item.type == 'movie' ? 'Filme' : 'Série' }}</v-chip>
    </template>

    <template v-slot:bottom>
      <v-divider class="mb-4"></v-divider>

      <v-pagination
        :length="props.metadata.totalPages"
        v-model="selectedPage"
        @update:model-value="updatePage(selectedPage)"
        :total-visible="5"
        rounded="circle"
        active-color="green"
      ></v-pagination>
    </template>
  </v-data-table-server>
</template>

<script setup lang="ts">
  export interface TableItem {
    title: string,
    type: string,
    averageRating: string,
    genres: string,
    numVotes: number,
    releaseYear: string,
  }

  export interface Metadata {
    hasNextPage: boolean,
    hasPrevPage: boolean,
    nextPage: number,
    page: number,
    prevPage: number | null,
    returnedItems: number,
    rows: number,
    totalItems: number,
    totalPages: number,
  }

  const emit = defineEmits(['update:currentPage'])
  const props = defineProps<{
    header: object[],
    items: TableItem[]
    metadata: Metadata
  }>()

  function updatePage(newPage: number) {
    emit('update:currentPage', newPage)
  }
  const selectedPage = ref(props.metadata.page)
</script>