<template>
  <div class="h-screen bg-bg-card flex flex-col py-2">
    <!-- Header Bar -->
    <header class="w-full flex items-center text-xs space-x-2 text-button-text px-4">
      <h1 class="text-5xl font-extrabold text-indigo-600
        hover:text-indigo-500 
        transform hover:scale-105 
        transition duration-200">
        SciFind
      </h1>
      <button
        class="font-bold rounded-4xl bg-white px-6 py-2 hover:bg-button-bg-hover hover:cursor-pointer">
        All +
      </button>
      <button
        class="font-bold rounded-4xl bg-white px-6 py-2 hover:bg-button-bg-hover hover:cursor-pointer">
        News +
      </button>
      <button
        class="font-bold rounded-4xl bg-white px-6 py-2 hover:bg-button-bg-hover hover:cursor-pointer">
        Exclusives +
      </button>
      <button
        class="font-bold rounded-4xl bg-white px-6 py-2 hover:bg-button-bg-hover hover:cursor-pointer">
        Guides +
      </button>
      <button
        class="font-bold rounded-4xl bg-white px-6 py-2 hover:bg-button-bg-hover hover:cursor-pointer">
        Language
      </button>
    </header>
    <!-- Main Content -->
    <main
      class="flex-1 flex flex-row py-4 space-x-8 overflow-y-auto"
    >
      <!-- Best of Week on the left -->
      <div class="w-2/5 pl-4">
        <BestOfWeek :news-list="newsPanelContent" />
      </div>

      <!-- SearchBar and PreviewPanel in the center -->
      <div class="w-3/5">
        <div class="max-w-2xl mx-auto">
          <div class="bg-white p-6 rounded-4xl shadow-lg space-y-6">
            <SearchBar />
            <ArticlePreviewPanel
              @article-click="navigateToArticle"
              :news-content="newsPanelContent" />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import BestOfWeek from "@/components/BestOfWeek.vue";

const navigateToArticle = (title) => {
  console.log("Navigating to", title);
};

const sampleNews = {
  title: "Ethereum 2.0 Launch: What It Means for the Future of Blockchain",
  author: "Jane Doe",
  publishedDate: "2024-06-10",
  image:
    "https://i0.wp.com/plopdo.com/wp-content/uploads/2021/11/feature-pic.jpg?fit=537%2C322&ssl=1",
  content: `
    The long-awaited Ethereum 2.0 upgrade has finally launched, marking a significant milestone in the evolution of blockchain technology. 
    This upgrade transitions Ethereum from a proof-of-work (PoW) consensus mechanism to proof-of-stake (PoS), aiming to improve scalability, security, and energy efficiency.

    According to Ethereum Foundation, the upgrade will allow the network to process thousands of transactions per second, drastically reducing fees and congestion. 
    "Ethereum 2.0 is a game-changer," said Vitalik Buterin, co-founder of Ethereum. "It paves the way for mass adoption and new decentralized applications."

    The transition has not been without challenges. Developers spent years testing and refining the protocol to ensure a smooth rollout. 
    Many in the crypto community are optimistic, believing that Ethereum 2.0 will attract more developers and investors to the ecosystem.

    As the upgrade rolls out, users are encouraged to stake their ETH to help secure the network and earn rewards. 
    The Ethereum Foundation has published detailed guides to assist users in migrating to the new system.

    The successful launch of Ethereum 2.0 is expected to have ripple effects across the entire blockchain industry, setting new standards for performance and sustainability.
  `,
};

const newsPanelContent = ref([
  {
    title: "Bitcoin ETFs Could Surpass $50 Billion Market",
    author: "BitMEX Research",
    previewContent:
      "US-approved spot Bitcoin ETFs could change the entire crypto landscape.",
    image:
      "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.Ptvu1XN_pEWJjsbZpwb1BQHaEK%26pid%3DApi&f=1&ipt=b6172bcdb1b5c3cdddd7af17e1d7912a59c388501b5cd17f34ce1a4cea061867&ipo=images",
  },
  {
    title: "STX Price Prediction: What’s in Store for 2024?",
    author: "Crypto Insights",
    previewContent:
      "After a 126% price jump in December, experts weigh in on STX's future.",
    image:
      "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.esErrCrq_RxgKztUW0cLJQHaEK%26pid%3DApi&f=1&ipt=c0026160785ff07fad7a2dbdc921b594bfba590c39805d0264e4989751044ad1&ipo=images",
  },
  {
    title: "Solana’s Growth Continues in 2025",
    author: "Solana Daily",
    previewContent:
      "Solana ecosystem expands with new projects and partnerships this year.",
    image:
      "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.r5F06c-VQRaU2luSlxEobAHaEs%26pid%3DApi&f=1&ipt=ca81354928dffd1c35e42ff29b8200a360f2475886cabcd454cd036869d24879&ipo=images",
  },
  {
    title: "Sam Bankman-Fried and Debtors Reach Settlement",
    author: "Crypto Courtroom",
    previewContent:
      "Former FTX CEO and debtors reach a settlement in ongoing proceedings.",
    image:
      "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.Udj8HRs29B7To9llt-dNKwHaEm%26pid%3DApi&f=1&ipt=a92d0f7c550f42cef677098aeecd11a22a4ecc9b3a74d21363b9d6d480bd9de9&ipo=images",
  },
]);
</script>

<style scoped>
/* Adjusting button hover colors */
button {
  transition: background-color 0.3s ease;
}

button.bg-button-bg {
  background-color: var(
    --color-button-bg
  ); /* Different shade for SciFind button */
}

button.bg-button-bg:hover {
  background-color: var(
    --color-bg-highlight
  ); /* Hover effect for SciFind button */
}

button.bg-white {
  background-color: var(
    --color-button-bg
  ); /* Default white for other buttons */
}

button.bg-white:hover {
  background-color: var(
    --color-button-bg-hover
  ); /* Hover effect for other buttons */
}
</style>
