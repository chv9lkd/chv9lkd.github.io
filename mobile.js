<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Starbucks Mobile Ordering</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.16/dist/tailwind.min.css">
  <script crossorigin src="https://unpkg.com/react@17/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@17/umd/react-dom.production.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/axios/0.21.1/axios.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <div id="root"></div>

  <script type="text/babel">
    const { Card, CardContent, CardFooter, CardHeader, CardTitle } = shadcn.components;
    const { Button } = shadcn.components;
    const { Input } = shadcn.components;
    const { Badge } = shadcn.components;
    const { ShoppingCart, Coffee, Pizza, ChevronDown, Plus, Minus } = lucideReact;

    const MobileOrderingApp = () => {
      const [menuItems, setMenuItems] = useState([]);
      const [cart, setCart] = useState([]);
      const [activeCategory, setActiveCategory] = useState('drinks');
      const [orderStatus, setOrderStatus] = useState(null);

      useEffect(() => {
        // Fetch menu items from backend API
        const fetchMenuItems = async () => {
          try {
            const response = await axios.get('/api/menu');
            setMenuItems(response.data);
          } catch (error) {
            console.error('Error fetching menu items:', error);
          }
        };
        fetchMenuItems();
      }, []);

      const addToCart = (item) => {
        const existingItem = cart.find((cartItem) => cartItem.id === item.id);
        if (existingItem) {
          setCart(cart.map((cartItem) =>
            cartItem.id === item.id
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          ));
        } else {
          setCart([...cart, { ...item, quantity: 1 }]);
        }
      };

      const removeFromCart = (itemId) => {
        setCart(cart.filter((item) => item.id !== itemId));
      };

      const updateQuantity = (itemId, delta) => {
        setCart(cart.map((item) => {
          if (item.id === itemId) {
            const newQuantity = Math.max(0, item.quantity + delta);
            return newQuantity === 0 ? null : { ...item, quantity: newQuantity };
          }
          return item;
        }).filter(Boolean));
      };

      const calculateTotal = () => {
        return cart.reduce((total, item) => total + item.price * item.quantity, 0);
      };

      const handleCheckout = async () => {
        // Process checkout with payment gateway
        setOrderStatus('processing');
        try {
          await axios.post('/api/orders', { items: cart });
          setOrderStatus('confirmed');
          setCart([]);
        } catch (error) {
          console.error('Error processing order:', error);
          setOrderStatus('error');
        }
      };

      return (
        <div className="max-w-md mx-auto p-4 flex flex-col h-screen bg-gray-50">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Campus Café</h1>
            <div className="relative">
              <ShoppingCart className="h-6 w-6" />
              {cart.length > 0 && (
                <Badge className="absolute -top-2 -right-2">{cart.length}</Badge>
              )}
            </div>
          </div>

          {/* Category Selector */}
          <div className="flex space-x-4 mb-6">
            <Button
              variant={activeCategory === 'drinks' ? 'default' : 'outline'}
              onClick={() => setActiveCategory('drinks')}
            >
              <Coffee className="mr-2 h-4 w-4" />
              Drinks
            </Button>
            <Button
              variant={activeCategory === 'food' ? 'default' : 'outline'}
              onClick={() => setActiveCategory('food')}
            >
              <Pizza className="mr-2 h-4 w-4" />
              Food
            </Button>
          </div>

          {/* Menu Items */}
          <div className="flex-grow overflow-auto mb-4">
            {menuItems.filter(item => item.category === activeCategory).map((item) => (
              <Card key={item.id} className="mb-4">
                <CardContent className="p-4 flex items-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover mr-4"
                  />
                  <div className="flex-grow">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-gray-600">${item.price.toFixed(2)}</p>
                  </div>
                  <Button onClick={() => addToCart(item)}>Add</Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Cart Summary */}
          {cart.length > 0 && (
            <Card className="mt-auto">
              <CardHeader>
                <CardTitle>Your Order</CardTitle>
              </CardHeader>
              <CardContent>
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between mb-2">
                    <span>{item.name}</span>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span>{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-lg font-semibold">
                  Total: ${calculateTotal().toFixed(2)}
                </div>
                <Button
                  onClick={handleCheckout}
                  disabled={orderStatus === 'processing' || orderStatus === 'confirmed'}
                >
                  {orderStatus === 'processing' ? 'Processing...' : orderStatus === 'confirmed' ? 'Order Confirmed' : 'Checkout'}
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Error Handling */}
          {orderStatus === 'error' && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <Card className="w-80">
                <CardContent className="p-6 text-center">
                  <h2 className="text-xl font-bold mb-4">Oops, something went wrong!</h2>
                  <p>Please try placing your order again.</p>
                  <Button
                    className="mt-4"
                    onClick={() => setOrderStatus(null)}
                  >
                    Close
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      );
    };

    ReactDOM.render(<MobileOrderingApp />, document.getElementById('root'));
  </script>

  <script src="https://cdn.jsdelivr.net/npm/@shadcn/ui@0.1.0/dist/index.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/lucide-react@0.86.0/dist/lucide-react.min.js"></script>
</body>
</html>