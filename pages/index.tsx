import React, { useState } from 'react';
import Listings from '../components/Listings';
import RootLayout from '../components/RootLayout';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import '../firebase';

export default function Index() {
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);


    const handleCategoryToggle = (category: string) => {
        const currentIndex = selectedCategories.indexOf(category);
        const newSelected = [...selectedCategories];
    
        if (currentIndex === -1) {
            newSelected.push(category);
        } else {
            newSelected.splice(currentIndex, 1);
        }
    
        setSelectedCategories(newSelected);
    };
    
    return (
        <RootLayout>
            <main className="flex min-h-screen flex-col items-center py-1 bg-gray-100">
                <div className="z-10 w-full items-center justify-between font-bold text-lg lg:center">
                    <p className="mb-8 text-center border-b border-gray-300 text-gray-200 py-4 backdrop-blur-md bg-indigo-600">
                        FalconShop
                    </p>
                </div>
                <div className="p-4">
                    {/* Use ToggleButtonGroup and ToggleButton for category filtering */}
                    <ToggleButtonGroup
                        value={selectedCategories}
                        onChange={(_, newCategories) => setSelectedCategories(newCategories)}
                        aria-label="Category Selection"
                    >
                        <ToggleButton value="Books/Study">
                            Books/Study
                        </ToggleButton>
                        <ToggleButton value="Clothing/Shoes">
                            Clothing/Shoes
                        </ToggleButton>
                        <ToggleButton value="Electronics">
                            Electronics
                        </ToggleButton>
                        <ToggleButton value="Uniform">
                            Uniform
                        </ToggleButton>
                        <ToggleButton value="Vehicles">
                            Vehicles
                        </ToggleButton>
                        <ToggleButton value="Cooking">
                            Cooking
                        </ToggleButton>
                        <ToggleButton value="Appliances">
                            Appliances
                        </ToggleButton>
                        <ToggleButton value="Other">
                            Other
                        </ToggleButton>
                    </ToggleButtonGroup>
                </div>
                <div className="p-4">
                    <Listings selectedCategories={selectedCategories} />
                </div>
            </main>
        </RootLayout>
    );
}
