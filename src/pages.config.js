import Home from './pages/Home';
import Categories from './pages/Categories';
import Search from './pages/Search';
import Events from './pages/Events';
import MyProfile from './pages/MyProfile';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import Cities from './pages/Cities';
import CityDetail from './pages/CityDetail';
import Attractions from './pages/Attractions';
import AttractionDetail from './pages/AttractionDetail';
import Restaurants from './pages/Restaurants';
import Hotels from './pages/Hotels';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import Contact from './pages/Contact';
import LanguageContext from './pages/LanguageContext';
import translations from './pages/translations';
import MyFavorites from './pages/MyFavorites';
import MyItineraries from './pages/MyItineraries';
import ItineraryDetail from './pages/ItineraryDetail';
import LocalServices from './pages/LocalServices';
import BusinessSearch from './pages/BusinessSearch';
import BusinessDetail from './pages/BusinessDetail';
import SubmitListing from './pages/SubmitListing';
import BelgianCulture from './pages/BelgianCulture';
import ChristmasMarkets from './pages/ChristmasMarkets';
import ExplorerProfile from './pages/ExplorerProfile';
import AdminDashboard from './pages/AdminDashboard';
import AdminCities from './pages/AdminCities';
import AdminListings from './pages/AdminListings';
import AdminReviews from './pages/AdminReviews';
import AdminBlog from './pages/AdminBlog';
import AdminEvents from './pages/AdminEvents';
import AdminMedia from './pages/AdminMedia';
import UserProfile from './pages/UserProfile';
import AdminLogin from './pages/AdminLogin';
import SearchResults from './pages/SearchResults';
import Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Categories": Categories,
    "Search": Search,
    "Events": Events,
    "MyProfile": MyProfile,
    "Feed": Feed,
    "Profile": Profile,
    "Cities": Cities,
    "CityDetail": CityDetail,
    "Attractions": Attractions,
    "AttractionDetail": AttractionDetail,
    "Restaurants": Restaurants,
    "Hotels": Hotels,
    "Blog": Blog,
    "BlogDetail": BlogDetail,
    "Contact": Contact,
    "LanguageContext": LanguageContext,
    "translations": translations,
    "MyFavorites": MyFavorites,
    "MyItineraries": MyItineraries,
    "ItineraryDetail": ItineraryDetail,
    "LocalServices": LocalServices,
    "BusinessSearch": BusinessSearch,
    "BusinessDetail": BusinessDetail,
    "SubmitListing": SubmitListing,
    "BelgianCulture": BelgianCulture,
    "ChristmasMarkets": ChristmasMarkets,
    "ExplorerProfile": ExplorerProfile,
    "AdminDashboard": AdminDashboard,
    "AdminCities": AdminCities,
    "AdminListings": AdminListings,
    "AdminReviews": AdminReviews,
    "AdminBlog": AdminBlog,
    "AdminEvents": AdminEvents,
    "AdminMedia": AdminMedia,
    "UserProfile": UserProfile,
    "AdminLogin": AdminLogin,
    "SearchResults": SearchResults,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: Layout,
};