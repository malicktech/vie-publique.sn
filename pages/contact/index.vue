<script setup lang="ts">
/* SEO */
useHead({
  title: "Contact",
  meta: [
    {
      name: "description",
      content: "Contactez-nous via email ou sur nos réseaux sociaux.",
    },
  ],
});
</script>

<template>
  <div class="flex flex-col items-center px-4 sm:px-8">
    <div class="prose prose-sm sm:prose mx-auto my-2">
      <h1 class="text-center">Contactez-nous</h1>
    </div>

    <div class="w-full max-w-4xl text-center">
      <div class="mb-4">
        <h2 class="text-gray-500 sm:text-xl">
          Vous souhaitez nous transmettre des informations, nous faire des
          suggestions, nous signalez des erreur ou nous soumettre une
          proposition de partenariat, envoyez nous un Email à l'adresse mail
          suivante
        </h2>
        <p class="py-8 text-xl text-blue-600 underline hover:text-blue-800">
          <a href="mailto:contact@vie-publique.sn">contact@vie-publique.sn</a>
        </p>
      </div>

      <div class="mb-4 hidden">
        <h2 class="text-md text-gray-500">Linkedin</h2>
        <a
          href="https://linkedin.com/in/malicktech/"
          target="_blank"
          rel="noopener"
          class="space-x-2 text-blue-600 hover:text-blue-800"
        >
          <!-- <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0zM7.2 20.45H3.56V9h3.64v11.45zM5.38 7.58c-1.15 0-2.07-.93-2.07-2.07s.93-2.07 2.07-2.07c1.14 0 2.07.93 2.07 2.07.01 1.14-.92 2.07-2.07 2.07zM20.45 20.45h-3.64v-5.91c0-1.41-.03-3.21-1.96-3.21-1.97 0-2.27 1.53-2.27 3.11v6.01H9.5V9h3.49v1.56h.05c.49-.93 1.7-1.91 3.5-1.91 3.74 0 4.43 2.46 4.43 5.66v6.14h-.02z" />
                    </svg> -->
          <span>@malicktech</span>
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
