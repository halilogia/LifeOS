interface FooterQuoteProps {
  quoteText: string;
}

export function FooterQuote({ quoteText }: FooterQuoteProps) {
  return (
    <footer className="footer-quote">
      <p
        id="quote"
        className="quote-text"
        style={{
          fontStyle: "italic",
          textAlign: "center",
          opacity: 0.85,
          fontSize: "0.95rem",
        }}
      >
        {quoteText}
      </p>
    </footer>
  );
}
