<template>
  <v-data-table-server
    :headers="columnsHeaderView"
    :items="props.items"
    :items-length="props.items.length"
    v-model:sort-by="sortBy"
    v-on:update:sort-by="applyFilters"
    class="rounded pa-3"
  >
    <!-- Costumização do header -->
    <template v-slot:headers="{ columns, isSorted, getSortIcon, toggleSort }">
      <tr class="bg-green-darken-2">
        <template v-for="column in columns" :key="column.value">
          <th>
            <span class="mr-1">{{ column.title }}</span>

            <!-- Botão de ordenação -->
            <v-tooltip text="Ordenar" location="bottom">
              <template v-slot:activator="{ props }">
                <v-btn 
                  v-if="column.sortable"
                  :icon="isSorted(column) ? getSortIcon(column) : 'mdi-minus'" 
                  size="26" 
                  variant="tonal"
                  v-bind="props"
                  class="mr-1"
                  @click="() => toggleSort(column)"
                ></v-btn>
              </template>
            </v-tooltip>
          </th>
        </template>
      </tr>
    </template>

    <template v-slot:top>
      <div class="d-flex ga-2">
        <!-- Menu de filtragem -->
        <div class="mb-10" v-if="props.items && props.metadata">
          <v-menu 
            :close-on-content-click="false" 
            v-if="props.hasFiltersLabel" 
            v-model="activatorMenu"
          >
            <template v-slot:activator="{ props }">
              <v-btn 
                color="green" 
                v-bind="props" 
                append-icon="mdi-filter"
                variant="outlined"
              > Filtrar </v-btn>
            </template>
  
            <v-card
              width="400"
            >
              <v-card-title primary-title>Filtragem</v-card-title>
  
              <v-card-text v-for="(filterLabel, index) in filtersLabel" :key="index">
  
                <v-row v-if="filterLabel.componentType == 'textField'">
                  <v-col>
                    <v-text-field
                      :label="filterLabel.label"
                      v-model="filterLabel.inputValue"
                      @click:clear="filterLabel.inputValue = null"
                      clearable
                    ></v-text-field>
                  </v-col>
                </v-row>
  
                <v-row v-if="filterLabel.componentType == 'comboBox'">
                  <v-col>
                    <v-combobox
                      :label="filterLabel.label"
                      :items="filterLabel.items"
                      v-model="filterLabel.inputValue"
                      clearable
                    ></v-combobox>
                  </v-col>
                </v-row>
              </v-card-text>
  
              <v-card-actions>
                <v-btn 
                  color="green"
                  variant="tonal"
                  @click="applyFilters"
                >Aplicar</v-btn>
  
                <v-btn 
                  color="red"
                  variant="tonal"
                  @click="clearAllFilters()"
                >Limpar</v-btn>
              </v-card-actions>
            </v-card>
          </v-menu>
        </div>
  
        <!-- Menu de vizualização de colunas -->
        <div>
          <v-menu
            :close-on-content-click="false" 
            v-if="props.hasFiltersLabel" 
            v-model="activatorMenuView"
          >
            <template v-slot:activator="{ props }">
              <v-btn 
                color="green" 
                v-bind="props" 
                append-icon="mdi-view-column"
                variant="outlined"
              >Exibir Colunas</v-btn>
            </template>

            <v-card width="400">
              <v-card-title primary-title>Exibir Colunas</v-card-title>

              <v-card-text>
                <!-- alterando o header da tabela de acordo com as colunas selecionadas no checkbox -->
                <!-- o v-on:update:model-value aplica a função para ordenar as colunas selecionadas para a sua posição correta  -->
                <v-checkbox 
                  v-for="column in props.header" 
                  :key="column.value"
                  :label="column.title"
                  :value="column"
                  density="compact"
                  v-model="columnsHeaderView"
                  v-on:update:model-value="() => columnsHeaderView.sort((a,b) => a.placing - b.placing)"
                ></v-checkbox>
              </v-card-text>
            </v-card>
          </v-menu>
        </div>
      </div>
    </template>

    <template v-slot:no-data>
      <span> <v-icon>mdi-emoticon-sad</v-icon> Nenhum registro foi encontrado </span>
    </template>

    <template v-slot:item.type="{ item }">
      <span>{{ item.type == 'movie' ? 'Filme' : 'Série' }}</span>
    </template>

    <template v-slot:bottom>
      <v-divider class="mb-4"></v-divider>

      <v-pagination
        :length="props.metadata.totalPages"
        v-model="metadata.page"
        @update:model-value="applyFilters"
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

  export interface FilterLabel {
    label: string,
    componentType: 'textField' | 'comboBox' | 'autoComplete',
    inputValue?: any
    items?: any[]
  }

  export interface Header {
    placing: number,
    title: string,
    value: string,
    sortable?: boolean,
    key?: string
  }

  const emit = defineEmits([
    'update:currentPage', 
    'applyFilters'
  ])
  const props = defineProps<{
    header: Header[],
    items: TableItem[],
    metadata: Metadata,
    hasFiltersLabel?: boolean,
    filtersLabel?: FilterLabel[],
    sortBy: {
      key: string,
      order: 'asc' | 'desc',
    }[]
  }>()
  const activatorMenu = ref<boolean>(false)
  const activatorMenuView = ref<boolean>(false)
  const columnsHeaderView = ref(props.header)
  const sortBy = ref(props.sortBy)

  //Emitindo envento que retorna os filtros de busca e a página escolhida
  function applyFilters() {
    //Formatando valores padrões para 1 e -1
    let newSortBy = sortBy.value.map((value) => {
      if (value.order == 'asc') return {key: value.key, order: 1}
      if (value.order == 'desc') return {key: value.key, order: -1}
    }) 

    emit('applyFilters', props.filtersLabel, props.metadata.page, newSortBy)
    activatorMenu.value = false
  }

  //Limpando os filtros e voltando para a página inicial
  function clearAllFilters() {
    props.filtersLabel?.map(filterLabel => filterLabel.inputValue = null)
    props.metadata.page = 1
    applyFilters()
  }
</script>