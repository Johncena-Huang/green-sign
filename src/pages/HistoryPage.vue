<template>
  <div class="history-container">
    <!-- HEADER GROUP-->
    <div class="header-group">
      <!-- Header(zero-usage) -->
      <div class="header-zero-usage-wrapper" style="display: none">
        <header class="header-zero-usage">
          <img class="logo" src="../assets/logo.png" alt="logo" />
          <q-btn class="go-back-icon" icon="chevron_left" dense rounded flat />
        </header>
      </div>
      <!-- Header(used more than once) -->
      <header class="header">
        <q-btn class="go-back-icon" icon="chevron_left" dense rounded flat />
        <div class="search-bar-group">
          <q-input
            dark
            borderless
            v-model="searchField"
            input-class="text-left"
            placeholder="請輸入關鍵字..."
            dense
            class="search-bar search-bar--desktop"
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
            dark
            borderless
            v-model="searchField"
            input-class="text-right"
            dense
            class="search-bar search-bar--mobile"
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
    </div>
    <!-- CONTENT WRAPPER -->
    <div class="content-wrapper">
      <div class="content">
        <div
          class="record-list"
          v-for="{ year, records } in placeholderArray"
          :key="year"
        >
          <div class="record-list__year">{{ year }}</div>
          <div
            class="record-list__item"
            v-for="{ date, content } in records"
            :key="`${date} + ${content}`"
          >
            <span class="record-list__date">{{ date }}</span>
            <span class="record-list__content">{{ content }}</span>
          </div>
        </div>
      </div>
    </div>
    <!-- BACKDROP-GROUP -->
    <div class="backdrop-group">
      <div class="backdrop-zero-usage" style="display: none">
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
      <div class="backdrop"></div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
// const getDatePart = (dateString, part) => {
//   if (!dateString || (part !== "year" && part !== "monthDate")) return null;
//   const [year, month, day] = dateString.split("/");
//   if (part === "year") {
//     return year;
//   } else {
//     return `${month}/${day}`;
//   }
// };
// const sortByKeyword = (ary, keyword) => {
//   if (ary.length === 0) return;
//   const stringifiedKeyword = keyword.toString();
//   return ary.filter(({ date: dateString, content }) => {
//     if (
//       dateString.includes(stringifiedKeyword) ||
//       content.includes(stringifiedKeyword)
//     ) {
//       return true;
//     }
//     return false;
//   });
// };
// const transformToList = ary.reduce((acc, { date, content }) => {
//   const monthRecord = {
//     date: getDatePart(date, "monthDate"),
//     content: content,
//   };
//   const yearRecord = acc.find((obj) => obj.year === getDatePart(date, "year"));
//   if (yearRecord) {
//     yearRecord.monthRecords.push(monthRecord);
//   } else {
//     acc.push({
//       year: getDatePart(date, "year"),
//       monthRecords: [monthRecord],
//     });
//   }
//   return acc;
// }, []);

// const ary = [
//   {
//     date: "2022/03/01",
//     content: "lalalaalall",
//   },
//   { date: "2021/03/01", content: "lalalaalall" },
//   {
//     date: "2021/03/03",
//     content: "lalalaalall",
//   },
//   { date: "2021/03/04", content: "lalalaalall" },
//   {
//     date: "2021/05/01",
//     content: "lalalaalall",
//   },
//   { date: "2021/06/01", content: "lalalaalall" },
// ];
const placeholderArray = [
  {
    year: 2020,
    records: [
      { date: "11/05", content: "2022年平面醫用口罩定額徵收調查意願書" },
      { date: "11/05", content: "2022年平面醫用口罩定額徵收調查意願書" },
      { date: "11/05", content: "2022年平面醫用口罩定額徵收調查意願書" },
      { date: "11/05", content: "2022年平面醫用口罩定額徵收調查意願書" },
    ],
  },
  {
    year: 2019,
    records: [
      { date: "11/05", content: "2022年平面醫用口罩定額徵收調查意願書" },
      { date: "11/05", content: "2022年平面醫用口罩定額徵收調查意願書" },
      { date: "11/05", content: "2022年平面醫用口罩定額徵收調查意願書" },
      { date: "11/05", content: "2022年平面醫用口罩定額徵收調查意願書" },
    ],
  },
];
const searchField = ref("");
const handleGoBack = () => {
  console.log("go back");
};
</script>

<style lang="scss" scoped>
// 1024px
$desktop-screen: 64em;
// 688px
$mobile-screen: 43em;
.history-container {
  // Proper way to set height and width to 100vh and vw across device width
  position: fixed;
  height: 100%;
  width: 100%;
  // Avoid Margin collapse due to margin-top from header-wrapper
  overflow: hidden;
}
.header-zero-usage-wrapper {
  margin: 2.8rem 12.2rem 2rem 4rem;
  height: 5.8rem;
}
.header-zero-usage {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .go-back-icon {
    display: none;
  }
}
.go-back-icon {
  color: rgba(255, 255, 255, 0.7);
}
.header {
  height: 7.2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(28, 139, 106, 1);
  .search-bar {
    font-weight: 400;
    font-size: 1.8rem;
    line-height: 27px;
    &--mobile {
      display: none;
      margin-right: 1rem;
    }
  }
  .go-back-icon {
    display: none;
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
  width: 100%;
  height: 100%;
  background-image: url("../assets/leaf-1.png"), url("../assets/leaf-2.png");
  background-repeat: no-repeat;
  background-position: 100% 0, 0 100%;
}
.backdrop {
  position: relative;
  width: 100%;
  height: 100%;
  background-image: url("../assets/history/phase-2.png");
  background-repeat: no-repeat;
  background-position: 95% 90%;
}

.content-wrapper {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: #f0f0f0;
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
  .header {
    height: 5.6rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .go-back-icon {
      display: inline-block;
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
