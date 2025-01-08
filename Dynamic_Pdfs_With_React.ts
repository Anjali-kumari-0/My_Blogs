// Topic: How to Generate a dynamic PDF from React component => Blog on medium (just search for explanation) 
// We are going to generate a 4-page PDF with a constant header and footer for all four pages. Each page will have dynamic data (e.g., data, period, userName, generatedDate, etc.) and a consistent design.
  const generatePDF = async (setLoading: (t: boolean) => void): Promise<void> => {
  try {
    setLoading(true);
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const headerHeight = 30;
    const footerHeight = 30;

    const renderToImage = async (
      component: React.ReactElement
    ): Promise<string> => {
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.top = '-9999px';
      document.body.appendChild(container);

      const root = createRoot(container);
      root.render(component);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(container, {
        scrollY: -window.scrollY,
        scale: 2,
        useCORS: true, // Allow cross-origin images
      });

      root.unmount();
      document.body.removeChild(container);

      return canvas.toDataURL('image/png');
    };

    const headerImg = await renderToImage(
      <ReportHeader period={REPORT_DUMMY_DATA.period} />
    );

    const pages = [
      <Page_1 key="page_1" data={REPORT_DUMMY_DATA} />,
      <Page_2 key="page_2" data={REPORT_DUMMY_DATA} />,
      <Page_3 key="page_3" data={REPORT_DUMMY_DATA} />,
      <Page_4 key="page_4" data={REPORT_DUMMY_DATA} />,
    ];

    for (let i = 0; i < pages.length; i++) {
      const imgData = await renderToImage(pages[i]);
      const imgWidth = pageWidth;
      const pageHeight = (pageWidth * 297) / 210;

      const footerImg = await renderToImage(
        <Report_Footer
          generatedAt={REPORT_DUMMY_DATA.generatedOn}
          generatedBy={REPORT_DUMMY_DATA.generatedBy}
          page={`${i + 1}`}
        />
      );

      if (i > 0) doc.addPage();

      doc.addImage(headerImg, 'PNG', 0, 0, imgWidth, headerHeight);
      doc.addImage(
        imgData,
        'PNG',
        0,
        headerHeight,
        imgWidth,
        pageHeight - headerHeight - footerHeight
      );
      doc.addImage(
        footerImg,
        'PNG',
        0,
        pageHeight - footerHeight,
        imgWidth,
        footerHeight
      );
    }

    doc.save('file.pdf');
    toast.success('Downloaded !');
  } catch {
    toast.error('Error generating PDF');
  } finally {
    setLoading(false);
  }
};
