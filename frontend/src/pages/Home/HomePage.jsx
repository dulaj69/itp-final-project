import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Button, 
  TextField, 
  InputAdornment,
  Chip,
  Paper,
  IconButton,
  Divider,
  useMediaQuery,
  useTheme,
  Rating,
  AppBar,
  Toolbar
} from '@mui/material';
import { Search as SearchIcon, ArrowForward, Favorite, ShoppingCart } from '@mui/icons-material';
import { Link } from 'react-router-dom';

// Import assets
import headerImg from '../../assets/header_img.png';
import logo from '../../assets/logo.png';
import food1 from '../../assets/food_1.png';
import food2 from '../../assets/food_2.png';
import food3 from '../../assets/food_3.png';
import food4 from '../../assets/food_4.png';
import food5 from '../../assets/food_5.png';
import food6 from '../../assets/food_6.png';
import food7 from '../../assets/food_7.png';
import food8 from '../../assets/food_8.png';
import food9 from '../../assets/food_9.png';
import food10 from '../../assets/food_10.png';
import food11 from '../../assets/food_11.png';
import food12 from '../../assets/food_12.png';
import food13 from '../../assets/food_13.png';
import food14 from '../../assets/food_14.png';

// Spice categories
const spiceCategories = [
  { name: 'Cloves', image: food1, count: 24 },
  { name: 'Chili', image: food2, count: 18 },
  { name: 'Spices', image: food3, count: 45 },
  { name: 'Cumin Powder', image: food4, count: 12 },
  { name: 'Sauce', image: food5, count: 30 },
  { name: 'Leaves', image: food6, count: 22 },
  { name: 'Ground Spices', image: food7, count: 35 },
  { name: 'Cumin Seeds', image: food8, count: 15 },
  { name: 'Whole Spices', image: food9, count: 28 },
];

// Featured products
const featuredProducts = [
  { id: 1, name: 'Black Pepper', image: food1, price: 120, rating: 4.5 },
  { id: 2, name: 'Cumin Seeds', image: food2, price: 180, rating: 4.8 },
  { id: 3, name: 'Cloves', image: food3, price: 160, rating: 4.7 },
  { id: 4, name: 'Bay Leaves', image: food4, price: 240, rating: 4.6 },
  { id: 5, name: 'Nutmeg', image: food5, price: 140, rating: 4.9 },
  { id: 6, name: 'Cinnamon', image: food6, price: 120, rating: 4.8 },
  { id: 7, name: 'Garlic', image: food7, price: 200, rating: 4.7 },
  { id: 8, name: 'Ginger', image: food8, price: 150, rating: 4.8 },
  { id: 9, name: 'Turmeric', image: food9, price: 150, rating: 4.9 },
  { id: 10, name: 'Cardamom', image: food10, price: 320, rating: 4.7 },
  { id: 11, name: 'Mustard Seeds', image: food11, price: 150, rating: 4.5 },
  { id: 12, name: 'Fennel Seeds', image: food12, price: 125, rating: 4.6 },
];

const HomePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#fff', 
      width: '100vw', 
      maxWidth: '100%',
      overflowX: 'hidden',
      m: 0,
      p: 0,
    }}>
      {/* Custom Navbar */}
      <AppBar position="static" color="transparent" elevation={0} sx={{ bgcolor: 'white', width: '100%' }}>
        <Container maxWidth={false} disableGutters sx={{ width: '100%', px: { xs: 2, sm: 4, md: 6, lg: 8 } }}>
          <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <img src={logo} alt="Spice Logo" style={{ height: 50 }} />
            </Box>
            
            {/* Navigation Links */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3 }}>
              <Typography 
                component={Link} 
                to="/" 
                sx={{ 
                  color: 'black', 
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': { color: '#ba6a34' } 
                }}
              >
                Home
              </Typography>
              <Typography 
                component={Link} 
                to="/shop" 
                sx={{ 
                  color: 'black', 
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': { color: '#ba6a34' } 
                }}
              >
                Shop
              </Typography>
              <Typography 
                component={Link} 
                to="/about" 
                sx={{ 
                  color: 'black', 
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': { color: '#ba6a34' } 
                }}
              >
                About
              </Typography>
              <Typography 
                component={Link} 
                to="/contact" 
                sx={{ 
                  color: 'black', 
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': { color: '#ba6a34' } 
                }}
              >
                Contact Us
              </Typography>
            </Box>
            
            {/* Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton size="small">
                <SearchIcon />
              </IconButton>
              <IconButton size="small">
                <ShoppingCart />
              </IconButton>
              <Button 
                variant="outlined" 
                component={Link}
                to="/login"
                sx={{ 
                  borderColor: '#ba6a34', 
                  color: '#ba6a34',
                  borderRadius: 4,
                  px: 2,
                  '&:hover': {
                    borderColor: '#ba6a34',
                    backgroundColor: 'rgba(186, 106, 52, 0.1)'
                  }
                }}
              >
                Sign In
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      
      {/* Hero Section */}
      <Box 
        sx={{
          background: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${headerImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '70vh',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          width: '100%',
          maxWidth: '100vw',
        }}
      >
        <Container maxWidth={false} disableGutters sx={{ width: '100%', px: { xs: 2, sm: 4, md: 6, lg: 8 } }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box sx={{ color: 'white', p: 2 }}>
                <Typography 
                  variant="h1" 
                  sx={{ 
                    fontWeight: 700, 
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    mb: 2
                  }}
                >
                  Order your <br />
                  favourite Spice <br />
                  here
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mb: 4,
                    opacity: 0.9,
                    maxWidth: '600px',
                    lineHeight: 1.8
                  }}
                >
                  Discover the perfect blend of flavors for your culinary adventures. Our premium spices are sourced from the finest regions, ensuring authentic taste and aroma for your dishes. From exotic blends to classic essentials, we have everything you need to elevate your cooking.
                </Typography>
                <Button 
                  variant="contained" 
                  size="large"
                  sx={{ 
                    bgcolor: '#ba6a34', 
                    fontSize: '1rem',
                    px: 4,
                    py: 1.5,
                    borderRadius: 1,
                    '&:hover': {
                      bgcolor: '#9e5a2c'
                    }
                  }}
                >
                  View Products
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Categories Section */}
      <Box sx={{ width: '100%' }}>
        <Container maxWidth={false} disableGutters sx={{ my: 8, px: { xs: 2, sm: 4, md: 6, lg: 8 }, width: '100%' }}>
          <Box sx={{ mb: 5 }}>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 600, mb: 1 }}>
              Explore Our Products
            </Typography>
            <Typography variant="body1" color="text.secondary">
              We provide a wide variety of high-quality spices to add flavor, aroma, and richness to your cooking.
            </Typography>
          </Box>
          
          <Grid container spacing={3} justifyContent="center">
            {spiceCategories.map((category) => (
              <Grid item xs={4} sm={3} md={2.4} lg={1.3} key={category.name}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)'
                    }
                  }}
                >
                  <Box 
                    sx={{
                      width: 70,
                      height: 70,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      mb: 1,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      border: '1px solid #eee'
                    }}
                  >
                    <img 
                      src={category.image} 
                      alt={category.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </Box>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 600,
                      textAlign: 'center'
                    }}
                  >
                    {category.name}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Top Products Section */}
      <Box sx={{ width: '100%' }}>
        <Container maxWidth={false} disableGutters sx={{ my: 8, px: { xs: 2, sm: 4, md: 6, lg: 8 }, width: '100%' }}>
          <Box sx={{ mb: 5 }}>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 600, mb: 1 }}>
              Top Products Near You
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            {featuredProducts.slice(0, 5).map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={2.4} key={product.id}>
                <Card 
                  sx={{ 
                    borderRadius: 2, 
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                    }
                  }}
                >
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      top: 10, 
                      right: 10, 
                      bgcolor: 'white',
                      borderRadius: '50%',
                      width: 30,
                      height: 30,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      zIndex: 1,
                      cursor: 'pointer'
                    }}
                  >
                    <Favorite sx={{ fontSize: 16, color: '#999' }} />
                  </Box>
                  <CardMedia
                    component="img"
                    height="180"
                    image={product.image}
                    alt={product.name}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
                    <Box sx={{ display: 'flex', mb: 1 }}>
                      <Rating value={product.rating} size="small" readOnly precision={0.5} />
                    </Box>
                    <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {product.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
                      <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 600, color: '#ba6a34' }}>
                        Rs.{product.price}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {/* Second row */}
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {featuredProducts.slice(5, 10).map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={2.4} key={product.id}>
                <Card 
                  sx={{ 
                    borderRadius: 2, 
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                    }
                  }}
                >
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      top: 10, 
                      right: 10, 
                      bgcolor: 'white',
                      borderRadius: '50%',
                      width: 30,
                      height: 30,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      zIndex: 1,
                      cursor: 'pointer'
                    }}
                  >
                    <Favorite sx={{ fontSize: 16, color: '#999' }} />
                  </Box>
                  <CardMedia
                    component="img"
                    height="180"
                    image={product.image}
                    alt={product.name}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
                    <Box sx={{ display: 'flex', mb: 1 }}>
                      <Rating value={product.rating} size="small" readOnly precision={0.5} />
                    </Box>
                    <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {product.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
                      <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 600, color: '#ba6a34' }}>
                        Rs.{product.price}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: '#222', color: 'white', py: 4, width: '100%' }}>
        <Container maxWidth={false} disableGutters sx={{ px: { xs: 2, sm: 4, md: 6, lg: 8 }, width: '100%' }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <img src={logo} alt="Spice Logo" style={{ height: 40, marginRight: 10, filter: 'brightness(0) invert(1)' }} />
              </Box>
              <Typography variant="body2" sx={{ mb: 2, opacity: 0.7 }}>
                Lorem Ipsum is simply dummy text of the printing and typesetting industry.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <IconButton size="small" sx={{ color: 'white' }}>
                  <Box component="span" sx={{ fontSize: 20 }}>f</Box>
                </IconButton>
                <IconButton size="small" sx={{ color: 'white' }}>
                  <Box component="span" sx={{ fontSize: 20 }}>t</Box>
                </IconButton>
                <IconButton size="small" sx={{ color: 'white' }}>
                  <Box component="span" sx={{ fontSize: 20 }}>in</Box>
                </IconButton>
              </Box>
            </Grid>
            
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                About
              </Typography>
              <Box component="ul" sx={{ pl: 0, listStyle: 'none', mt: 2 }}>
                <Box component="li" sx={{ mb: 1 }}>
                  <Link to="/" style={{ color: '#ffffff99', textDecoration: 'none', fontSize: '0.875rem' }}>
                    About Us
                  </Link>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Link to="/" style={{ color: '#ffffff99', textDecoration: 'none', fontSize: '0.875rem' }}>
                    Features
                  </Link>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Link to="/" style={{ color: '#ffffff99', textDecoration: 'none', fontSize: '0.875rem' }}>
                    News
                  </Link>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Company
              </Typography>
              <Box component="ul" sx={{ pl: 0, listStyle: 'none', mt: 2 }}>
                <Box component="li" sx={{ mb: 1 }}>
                  <Link to="/" style={{ color: '#ffffff99', textDecoration: 'none', fontSize: '0.875rem' }}>
                    How We Work
                  </Link>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Link to="/" style={{ color: '#ffffff99', textDecoration: 'none', fontSize: '0.875rem' }}>
                    Capital
                  </Link>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Link to="/" style={{ color: '#ffffff99', textDecoration: 'none', fontSize: '0.875rem' }}>
                    Security
                  </Link>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={6} md={4}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                GET IN TOUCH
              </Typography>
              <Box component="ul" sx={{ pl: 0, listStyle: 'none', mt: 2 }}>
                <Box component="li" sx={{ mb: 1, fontSize: '0.875rem', color: '#ffffff99' }}>
                  +94 712 571 22
                </Box>
                <Box component="li" sx={{ mb: 1, fontSize: '0.875rem', color: '#ffffff99' }}>
                  info@spiceshop.com
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage; 