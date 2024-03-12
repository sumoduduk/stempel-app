import lang from "~/assets/lang.json";

export default function Hero() {
  return (
    <div class="flex h-1/2 w-full select-none flex-col items-center justify-center space-y-4">
      <img src="/logo.png" class="opacity-70" />
      <h2 class=" text-lg font-black">{lang.hero.eng}</h2>
    </div>
  );
}
