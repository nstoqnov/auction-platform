import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AuctionCard, { currency } from "./AuctionCard";

// AuctionCard uses react-router's useNavigate, so it must render inside a router.
const renderCard = (props) =>
  render(
    <MemoryRouter>
      <AuctionCard {...props} />
    </MemoryRouter>
  );

const activeAuction = {
  id: 1,
  title: "Vintage Rolex",
  description: "A rare timepiece in excellent condition.",
  status: "ACTIVE",
  currentBid: 1500,
  endTime: new Date("2030-01-02T00:00:00Z").toISOString(),
  categoryNames: ["Watches", "Luxury"],
  mainImageUrl: "",
};

describe("currency", () => {
  test("formats a number as whole-dollar USD", () => {
    expect(currency(1500)).toBe("$1,500");
    expect(currency(0)).toBe("$0");
    expect(currency(null)).toBe("$0"); // guards against NaN
  });
});

describe("AuctionCard", () => {
  test("renders an active lot's title, current bid and Live badge", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2030-01-01T00:00:00Z"));

    renderCard({ auction: activeAuction });

    expect(screen.getByText("Vintage Rolex")).toBeInTheDocument();
    expect(screen.getByText("Current bid")).toBeInTheDocument();
    expect(screen.getByText("$1,500")).toBeInTheDocument();
    expect(screen.getByText("Live")).toBeInTheDocument();

    jest.useRealTimers();
  });

  test("invokes onBidClick when a logged-in user clicks Bid", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2030-01-01T00:00:00Z"));

    const onBidClick = jest.fn();
    renderCard({ auction: activeAuction, onBidClick, isLoggedIn: true });

    fireEvent.click(screen.getByTitle("Place a bid"));
    expect(onBidClick).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });

  test("matches the snapshot for an upcoming lot", () => {
    // Upcoming lots have no live countdown, so the markup is time-independent.
    const upcoming = { ...activeAuction, status: "UPCOMING" };
    const { asFragment } = renderCard({ auction: upcoming });
    expect(asFragment()).toMatchSnapshot();
  });
});
