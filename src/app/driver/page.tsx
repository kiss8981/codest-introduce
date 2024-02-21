export default function Main() {
  return (
    <section className="text-gray-600 body-font ">
      <div className="max-w-7xl mx-auto flex px-5 py-24 md:flex-row flex-col items-center">
        <div className="lg:flex-grow md:w-1/2 md:ml-24 pt-6 flex flex-col md:items-start md:text-left mb-40 items-center text-center">
          <h1 className="mb-5 sm:text-5xl text-4xl items-center font-extrabold xl:w-2/2 text-gray-900">
            스쿨버스 위치를 실시간으로 확인하세요
          </h1>
          <p className="mb-4 xl:w-3/4 text-gray-600 text-lg">
            스쿨버스 위치를 실시간으로 확인하고, QR코드를 이용해 스쿨버스
            탑승자를 확인해 쉽게 정산을 처리 할 수 있습니다.
          </p>
          <div className="flex justify-center">
            <a
              className="inline-flex items-center px-5 py-3 mt-2 font-medium text-white transition duration-500 ease-in-out transform border rounded-lg bg-gray-900"
              href="mailto:admin@codest.kr"
            >
              <span className="justify-center">이용 문의하기</span>
            </a>
          </div>
        </div>
        <div className="xl:mr-44 sm:mr-0 sm:mb-28 mb-0 lg:mb-0 mr-48 md:pl-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="w-80 md:ml-1 ml-24"
            alt="iPhone-12"
            src="/images/driver/mockup.png"
          ></img>
        </div>
      </div>
      <section className="mx-auto">
        <div className="container px-5 mx-auto lg:px-24 ">
          <div className="flex flex-col w-full mb-4 text-left lg:text-center">
            <h1 className="mb-8 text-2xl font-semibold text-black">파트너사</h1>
          </div>
          <div className="grid gap-16 mb-16 text-center">
            <div className="flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo/jeilogo.png"
                alt="jeilogo"
                className="block object-contain h-16 greyC"
              ></img>
            </div>
          </div>
        </div>
      </section>
      <div className="grr max-w-7xl pt-20 mx-auto text-center px-4">
        <h1 className="mb-8 text-4xl font-extrabold text-gray-900">
          탑승확인 및 정산
        </h1>
        <h1 className="mb-8 text-2xl font-semibold text-gray-600 text-center">
          스쿨버스 탑승자를 QR코드로 간편하게 확인하고, 탑승 횟수에 따라 정산을
          쉽게 처리하세요.
        </h1>
        <div className="container flex flex-col items-center justify-center mx-auto rounded-lg ">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="object-cover object-center w-3/4 mb-10 g327 border rounded-lg shadow-md"
            alt="Placeholder Image"
            src="/images/driver/boarding.png"
          ></img>
        </div>
      </div>
    </section>
  );
}
