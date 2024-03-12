import lang from "~/assets/lang.json";

const About = () => {
  const { about } = lang;
  return (
    <div class="m-auto flex h-full w-full">
      <div class="m-auto">
        <div class="flex flex-col items-center justify-center space-y-1">
          <h1 class="text-center font-nueu text-4xl font-bold">
            {about.title.eng}
          </h1>
          <img src="logo.png" />
          <h2 class="font-bold">Stempel Inc.</h2>
          <h3>{about.h3.eng}</h3>
        </div>
      </div>
    </div>
  );
};

export default About;
