import * as React from "react";

interface User {
  imageSrc: string;
  name: string;
  email: string;
  score: string;
  
}

const UserCard = ({ imageSrc, name, email, score }:any) => (
  <div className="flex gap-5 items-start pt-3.5 pl-7 mt-5 w-full rounded-xl bg-zinc-950 bg-opacity-50 max-md:flex-wrap max-md:pl-5 max-md:max-w-full">
    <div className="flex gap-5 justify-between self-start">
      <img loading="lazy" src={imageSrc} alt={`Profile picture of ${name}`} className="shrink-0 w-28 max-w-full rounded-full aspect-square" />
      <div className="flex flex-col my-auto text-center">
        <h3 className="text-2xl font-semibold text-white">{name}</h3>
        <p className="mt-5 text-xl lowercase text-zinc-500">{email}</p>
      </div>
    </div>
    {score && (
      <div className="justify-center items-center self-end px-6 mt-16 text-2xl font-semibold text-white whitespace-nowrap rounded-xl bg-[linear-gradient(207deg,#727CF5_22.46%,#43488F_93.12%)] h-[60px] w-[60px] max-md:px-5 max-md:mt-10">
        {score}
      </div>
    )}
  </div>
);

function MyComponent() {
  const users = [
    { imageSrc: "https://cdn.builder.io/api/v1/image/assets/TEMP/484cdda32a85edcab5a8abbc82fbe693fa14a3354c28295a103f3db3b2d6dd97?apiKey=d0edcf51e7af4a84a6aee3a232edac89&", name: "Charvi Prashad", email: "Charvi Prashad1234@gmail.com", score: "7" },
    { imageSrc: "https://cdn.builder.io/api/v1/image/assets/TEMP/b49b25cc91ea4d29f0b9f6a8a6b64a42c9e165ac1c3ea190866b50cb4f8a0f57?apiKey=d0edcf51e7af4a84a6aee3a232edac89&", name: "Yajna Panchal", email: "Yajna Panchal2233@gmail.com" },
    { imageSrc: "https://cdn.builder.io/api/v1/image/assets/TEMP/1bcdfe35332513321b22adb9f7c234842b66772e6d92f8e505cb5abf2371efa9?apiKey=d0edcf51e7af4a84a6aee3a232edac89&", name: "Chintanika Teli", email: "Chintanika Teli@gmail.com", score: "5" },
    { imageSrc: "https://cdn.builder.io/api/v1/image/assets/TEMP/fc9fc588334e6a6874429b9e807c568ac72c3f67bf48478617364828a6c1e24e?apiKey=d0edcf51e7af4a84a6aee3a232edac89&", name: "Gauransh Chadha", email: "Gauransh Chadha@gmail.com" },
    { imageSrc: "https://cdn.builder.io/api/v1/image/assets/TEMP/78ede6eddad8e9c8d30e34ebe028c5a13ff81bf0c60af0b1d3e91317bc280da9?apiKey=d0edcf51e7af4a84a6aee3a232edac89&", name: "Manbir Koul", email: "Manbir Koul@gmail.com", score: "9+" },
    { imageSrc: "https://cdn.builder.io/api/v1/image/assets/TEMP/97c7d8cf7f4e8f860be9ff2ce5f029fad29dbd7f133275ac4af9e9618d748efb?apiKey=d0edcf51e7af4a84a6aee3a232edac89&", name: "Ihina Karigar", email: "Ihina Karigargmail.com" },
  ];

  return (
    <main className="flex flex-col px-10 pt-16 pb-6 rounded-3xl border-indigo-400 border-solid border-[3px] max-w-[700px] max-md:px-5">
      <header className="flex gap-5 justify-between text-2xl font-semibold text-center whitespace-nowrap max-md:flex-wrap">
        <img loading="lazy" src="https://cdn.builder.io/api/v1/image/assets/TEMP/cd2179c1ce40b9440984128ddd62aa7fc385276c961a8849bd4e8dd721323509?apiKey=d0edcf51e7af4a84a6aee3a232edac89&" alt="" className="shrink-0 my-auto aspect-square w-[50px]" />
        <div className="flex gap-5 py-1.5 bg-white rounded-xl max-md:flex-wrap max-md:max-w-full">
          <div className="justify-center px-14 pt-4 pb-2.5 text-white rounded-md bg-[linear-gradient(207deg,#727CF5_22.46%,#43488F_93.12%)] max-md:px-5">
            Leapsurge
          </div>
          <div className="flex-auto my-auto text-indigo-400">Company</div>
        </div>
        <img loading="lazy" src="https://cdn.builder.io/api/v1/image/assets/TEMP/c15778a56f90077abc382e8f47af03f99d3059528b7fc228c8c0ef1a40715697?apiKey=d0edcf51e7af4a84a6aee3a232edac89&" alt="" className="shrink-0 self-start aspect-square w-[50px]" />
      </header>

      <section>
        {users.map((user, index) => (
          <UserCard key={index} {...user} />
          // console.log("hello");
          
        ))}
      </section>

      <footer className="flex justify-center">
        <img loading="lazy" src="https://cdn.builder.io/api/v1/image/assets/TEMP/bb714edceb28f87eeed317a7171af0f2a95d481aaf190e3e7ebf6e179aa52f95?apiKey=d0edcf51e7af4a84a6aee3a232edac89&" alt="" className="self-center mt-10 border-white border-solid aspect-[1.49] border-[3px] stroke-[3.108px] stroke-white w-[49px]" />
      </footer>
    </main>
  );
}

export default MyComponent;