<template>
  <TextSpinner loadingText="資料讀取中" v-if="isLoading" />
  <div class="container-group" v-else>
    <!-- CONTAINER FOR ZERO USAGE CASE -->
    <div class="history-container-zero-usage" v-if="recordsArray.length === 0">
      <!-- HEADER -->
      <div class="header-zero-usage-wrapper">
        <header class="header-zero-usage">
          <img
            class="logo"
            src="../assets/logo.png"
            alt="logo"
            @click.prevent="handleGoBack"
          />
          <q-btn
            class="go-back-icon"
            icon="chevron_left"
            dense
            rounded
            flat
            @click.prevent="handleGoBack"
          />
        </header>
      </div>
      <!-- BACKDROP -->
      <div class="backdrop-zero-usage">
        <div class="pot-plant-wrapper">
          <div class="pot-plant">
            <img
              class="pot-plant__picture"
              src="../assets/history/phase-1.png"
              alt="pot-plant-1"
            />
            <span class="pot-plant__message">查無任何紀錄</span>
          </div>
        </div>
      </div>
    </div>
    <!-- NORMAL CONTAINER -->
    <div class="history-container" v-else>
      <!-- HEADER -->
      <header class="header">
        <q-btn
          class="go-back-icon"
          icon="chevron_left"
          dense
          rounded
          flat
          @click.prevent="handleGoBack"
        />
        <div class="search-bar-group">
          <q-input
            class="search-bar search-bar--desktop"
            input-class="text-left"
            placeholder="請輸入關鍵字..."
            v-model="searchField"
            debounce="500"
            dark
            borderless
            dense
          >
            <template v-slot:prepend>
              <q-icon v-if="searchField === ''" name="search" />
              <q-icon
                v-else
                name="clear"
                class="cursor-pointer"
                @click="searchField = ''"
              />
            </template>
          </q-input>
          <q-input
            class="search-bar search-bar--mobile"
            input-class="text-right"
            v-model="searchField"
            debounce="500"
            dark
            borderless
            dense
          >
            <template v-slot:append>
              <q-icon v-if="searchField === ''" name="search" />
              <q-icon
                v-else
                name="clear"
                class="cursor-pointer"
                @click="searchField = ''"
              />
            </template>
          </q-input>
        </div>
      </header>
      <!-- CONTENT -->
      <div class="content-wrapper">
        <div class="content">
          <div
            class="record-list"
            v-for="{ year, monthRecords } in arrayToRender"
            :key="year"
          >
            <div class="record-list__year">{{ year }}</div>
            <div
              class="record-list__item"
              v-for="{ date, fileName } in monthRecords"
              :key="`${date} + ${fileName}`"
            >
              <span class="record-list__date">{{ date }}</span>
              <span class="record-list__content">{{ fileName }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- BACKDROP -->
      <div
        class="backdrop"
        :style="{ 'background-image': `url(${potPlantUrl})` }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import TextSpinner from "src/components/TextSpinner.vue";
import { db } from "src/dexie/dexie";
const router = useRouter();
// ======================= DATA =======================
// State
const isLoading = ref(true);
const searchField = ref("");
let potPlantUrl = "";
let recordsArray = [];
// ======================= METHODS =======================
// Helpers
/**
 * Extract out certain parts of a date string based on the supplied argument
 * @param {string} dateString The date string(yyyy/mm/dd) to pass in
 * @param {string} part The part to extract out
 * @return {string} the returned date string
 */
const getDatePart = (dateString, part) => {
  if (!dateString || (part !== "year" && part !== "monthDate")) return null;
  const [year, month, day] = dateString.split("/");
  if (part === "year") {
    return year;
  } else {
    return `${month}/${day}`;
  }
};
/**
 * Sort the supplied array based on the keyword passed in
 * @param {array} ary
 * @param {string} keyword
 * @return {array}
 */
const sortByKeyword = (ary, keyword) => {
  if (ary.length === 0) return ary;
  const stringifiedKeyword = keyword.toString().toLowerCase();
  return ary.filter(({ date: dateString, fileName }) => {
    if (
      dateString.toLowerCase().includes(stringifiedKeyword) ||
      fileName.toLowerCase().includes(stringifiedKeyword)
    ) {
      return true;
    }
    return false;
  });
};
/**
 * Transform the array fetched from indexedDB into the renderable array format.
 * @param {array} ary
 * @return {array}
 */
const transformToRenderableArray = (ary) => {
  if (ary.length === 0) return ary;
  return ary.reduce((acc, { date, fileName }) => {
    const monthRecord = {
      date: getDatePart(date, "monthDate"),
      fileName: fileName,
    };
    const yearRecord = acc.find(
      (obj) => obj.year === getDatePart(date, "year")
    );
    if (yearRecord) {
      yearRecord.monthRecords.push(monthRecord);
    } else {
      acc.push({
        year: getDatePart(date, "year"),
        monthRecords: [monthRecord],
      });
    }
    return acc;
  }, []);
};
/**
 * Choose the right image(pot plant) based on the app usage count
 * @param {number} usageCount
 * @return {string} the path for the image to display
 */
const potPlantUrlSelector = (usageCount) => {
  switch (true) {
    case usageCount > 15:
      return require("src/assets/history/phase-5.png");
    case usageCount > 10:
      return require("src/assets/history/phase-4.png");
    case usageCount > 5:
      return require("src/assets/history/phase-3.png");
    case usageCount >= 1:
      return require("src/assets/history/phase-2.png");
    default:
      return require("src/assets/history/phase-1.png");
  }
};
// Handlers
const getDataFromDB = async () => {
  const fileRecords = await db.fileRecords.toArray();
  const reversedRecords = fileRecords.reverse();
  isLoading.value = false;
  recordsArray = reversedRecords;
  potPlantUrl = potPlantUrlSelector(reversedRecords.length);
};
const handleGoBack = () => {
  router.push("/");
};
// ======================= GETTER =======================
const arrayToRender = computed(() => {
  const sortedRecordsArray = sortByKeyword(recordsArray, searchField.value);
  const transformedArray = transformToRenderableArray(sortedRecordsArray);
  return transformedArray;
});
// ======================= LIFE CYCLE =======================
onMounted(() => {
  getDataFromDB();
});
</script>

<style lang="scss" scoped>
// 1024px
$desktop-screen: 64em;
// 688px
$mobile-screen: 43em;
.history-container-zero-usage,
.history-container {
  // Proper way to set height and width to 100vh and vw across device width
  position: fixed;
  height: 100%;
  width: 100%;
  background: #f0f0f0;
  // Avoid Margin collapse due to margin-top from header-wrapper
  overflow: hidden;
}
.header-zero-usage-wrapper {
  margin: 2.8rem 12.2rem 2rem 4rem;
  height: 5.8rem;
}
.go-back-icon {
  color: rgba(255, 255, 255, 0.7);
}
.header-zero-usage {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .go-back-icon {
    display: none;
  }
  .logo {
    cursor: pointer;
  }
}
.search-bar {
  font-weight: 400;
  font-size: 1.8rem;
  line-height: 27px;
  &--mobile {
    display: none;
    margin-right: 1rem;
  }
}
.header {
  height: 7.2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: rgba(28, 139, 106, 1);
  &::after {
    content: ""; // For centering the searbar and keep go-back-icon to the left
  }
}
.backdrop-group {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.backdrop-zero-usage {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  background-image: url("../assets/leaf-1.png"), url("../assets/leaf-2.png");
  background-repeat: no-repeat;
  background-position: 100% 0, 0 100%;
}
.backdrop {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  // background-image: url("../assets/history/phase-2.png");
  background-repeat: no-repeat;
  background-position: 95% 90%;
}

.content-wrapper {
  width: 100%;
  height: 100%;
  overflow-y: auto;
}
.content {
  margin: 3.6rem auto 0;
  max-width: 62rem;
}
.record-list {
  margin-bottom: 3.55rem;
  &__year {
    padding: 0 1.6rem;
    font-weight: 700;
    font-size: 1.6rem;
    line-height: 19px;
    color: #424242;
  }
  &__item {
    display: flex;
    align-items: center;
    gap: 1.2rem;
    padding: 2.05rem 1.2rem;
    margin-bottom: 1rem;
    background-color: gba(255, 255, 255, 1);
    box-shadow: 1px 4px 6px rgba(0, 0, 0, 0.11);
    border-radius: 13px;
    font-weight: 400;
    font-size: 1.6rem;
    color: #424242;
    cursor: pointer;
    transition: all 0.2s ease;
    &:hover,
    &:active {
      box-shadow: 2px 8px 12px rgba(0, 0, 0, 0.11);
      transform: translateY(-2px);
    }
  }
  &__date {
    line-height: 19px;
  }
  &__content {
    line-height: 23px;
    background: linear-gradient(180deg, #35a483 0%, #077854 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    text-fill-color: transparent;
  }
}
.pot-plant-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.pot-plant {
  display: inline-flex;
  flex-direction: column;
  gap: 3.3rem;
  &__message {
    font-weight: 400;
    font-size: 1.8rem;
    line-height: 27px;
    color: #424242;
  }
}
@media (max-width: $desktop-screen) {
  .history-container-zero-usage,
  .history-container {
    background-color: rgba(240, 240, 240, 0.58);
  }
  .header-zero-usage-wrapper {
    margin: 0;
  }
  .header-zero-usage {
    padding: 1rem 0;
    background-color: rgba(28, 139, 106, 1);
    .logo {
      display: none;
    }
    .go-back-icon {
      display: inline-block;
    }
  }
  .search-bar {
    font-size: 1.2rem;
    &--desktop {
      display: none;
    }
    &--mobile {
      display: inline-block;
    }
  }
  .header {
    height: 5.6rem;
    &::after {
      content: none;
    }
  }
  .content-wrapper {
    padding: 0 1.6rem;
  }
  .content {
    margin: 1.15rem auto 0;
  }
  .backdrop-zero-usage {
    background-image: none;
  }
}
</style>
