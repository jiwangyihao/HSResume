export const usePrint = () => {
  const printPage = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return { printPage };
};
