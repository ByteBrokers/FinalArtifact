import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Coins, ShoppingBag, X } from "lucide-react";
import type { CharacterCustomizationData } from "@/types/game";

interface CustomizationShopProps {
  open: boolean;
  onClose: () => void;
  characterData: CharacterCustomizationData;
  coins: number;
  onPurchase: (item: Partial<CharacterCustomizationData>, cost: number) => void;
}

interface ShopItem {
  id: string;
  name: string;
  category: 'expression' | 'pattern' | 'shoe' | 'hat' | 'accessory';
  cost: number;
  value: string;
  description: string;
  emoji: string;
}

const shopItems: ShopItem[] = [
  // Expressions
  { id: 'expr_cool', name: 'Cool Expression', category: 'expression', cost: 50, value: 'wink', description: 'A cool wink', emoji: '😎' },
  { id: 'expr_surprised', name: 'Surprised Look', category: 'expression', cost: 50, value: 'surprised', description: 'Wide-eyed surprise', emoji: '😮' },
  { id: 'expr_angry', name: 'Angry Face', category: 'expression', cost: 50, value: 'angry', description: 'Show them who\'s boss', emoji: '😠' },
  
  // Shirt Patterns
  { id: 'pattern_stripes', name: 'Striped Shirt', category: 'pattern', cost: 100, value: 'stripes', description: 'Classic vertical stripes', emoji: '👔' },
  { id: 'pattern_dots', name: 'Polka Dots', category: 'pattern', cost: 100, value: 'dots', description: 'Fun polka dot pattern', emoji: '⚫' },
  
  // Shoes
  { id: 'shoe_red', name: 'Red Sneakers', category: 'shoe', cost: 150, value: '#ff0000', description: 'Sporty red shoes', emoji: '👟' },
  { id: 'shoe_blue', name: 'Blue Boots', category: 'shoe', cost: 150, value: '#0000ff', description: 'Cool blue boots', emoji: '👢' },
  { id: 'shoe_gold', name: 'Golden Shoes', category: 'shoe', cost: 200, value: '#ffd700', description: 'Fancy golden footwear', emoji: '✨' },
  
  // Hats
  { id: 'hat_cap', name: 'Baseball Cap', category: 'hat', cost: 200, value: 'cap', description: 'Classic baseball cap', emoji: '🧢' },
  { id: 'hat_crown', name: 'Crown', category: 'hat', cost: 500, value: 'crown', description: 'Royal crown for VIPs', emoji: '👑' },
  { id: 'hat_tophat', name: 'Top Hat', category: 'hat', cost: 300, value: 'tophat', description: 'Classy top hat', emoji: '🎩' },
  
  // Accessories
  { id: 'acc_glasses', name: 'Sunglasses', category: 'accessory', cost: 250, value: 'glasses', description: 'Cool shades', emoji: '🕶️' },
  { id: 'acc_backpack', name: 'Backpack', category: 'accessory', cost: 180, value: 'backpack', description: 'Carry your data', emoji: '🎒' },
];

const CustomizationShop = ({ open, onClose, characterData, coins, onPurchase }: CustomizationShopProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handlePurchase = (item: ShopItem) => {
    if (coins < item.cost) {
      toast.error("Not enough coins!");
      return;
    }

    const updates: Partial<CharacterCustomizationData> = {};
    
    switch (item.category) {
      case 'expression':
        updates.facial_expression = item.value;
        break;
      case 'pattern':
        updates.shirt_pattern = item.value;
        break;
      case 'shoe':
        updates.shoe_color = item.value;
        break;
      case 'hat':
        updates.hat_type = item.value;
        break;
      case 'accessory':
        updates.accessory = item.value;
        break;
    }

    onPurchase(updates, item.cost);
    toast.success(`Purchased ${item.name}!`);
  };

  const isOwned = (item: ShopItem): boolean => {
    switch (item.category) {
      case 'expression':
        return characterData.facial_expression === item.value;
      case 'pattern':
        return characterData.shirt_pattern === item.value;
      case 'shoe':
        return characterData.shoe_color === item.value;
      case 'hat':
        return characterData.hat_type === item.value;
      case 'accessory':
        return characterData.accessory === item.value;
      default:
        return false;
    }
  };

  const filteredItems = selectedCategory === 'all' 
    ? shopItems 
    : shopItems.filter(item => item.category === selectedCategory);

  const categories = [
    { id: 'all', name: 'All Items', emoji: '🛍️' },
    { id: 'expression', name: 'Expressions', emoji: '😊' },
    { id: 'pattern', name: 'Patterns', emoji: '👕' },
    { id: 'shoe', name: 'Shoes', emoji: '👟' },
    { id: 'hat', name: 'Hats', emoji: '🎩' },
    { id: 'accessory', name: 'Accessories', emoji: '🕶️' },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ShoppingBag className="h-6 w-6 text-primary" />
            Customization Shop
          </DialogTitle>
          <DialogDescription>
            Upgrade your character with premium items
          </DialogDescription>
        </DialogHeader>

        {/* Balance Display */}
        <div className="flex items-center gap-3 p-4 bg-gradient-overlay rounded-lg border border-border">
          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
            <Coins className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Your Balance</div>
            <div className="text-xl font-bold text-foreground">{coins} coins</div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className="gap-1"
            >
              <span>{cat.emoji}</span>
              <span className="text-xs">{cat.name}</span>
            </Button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredItems.map(item => {
            const owned = isOwned(item);
            const canAfford = coins >= item.cost;

            return (
              <Card key={item.id} className={`border-border ${owned ? 'bg-muted/50' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{item.emoji}</span>
                      <div>
                        <CardTitle className="text-sm">{item.name}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                      </div>
                    </div>
                    {owned && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Owned</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                      <Coins className="h-4 w-4 text-primary" />
                      <span>{item.cost}</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handlePurchase(item)}
                      disabled={owned || !canAfford}
                      className="h-8"
                    >
                      {owned ? 'Equipped' : !canAfford ? 'Not enough coins' : 'Buy'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No items in this category
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CustomizationShop;
