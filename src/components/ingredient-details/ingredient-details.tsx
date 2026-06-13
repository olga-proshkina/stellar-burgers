import { FC } from 'react';
import { Preloader } from '../ui/preloader';
import { IngredientDetailsUI } from '../ui/ingredient-details';
import { useSelector } from '../../services/store';
import { selectSelectedIngredient } from '../../services/slices';

export const IngredientDetails: FC = () => {
  /** DONE: взять переменную из стора */
  const ingredientData = useSelector(selectSelectedIngredient);

  if (!ingredientData) {
    return <Preloader />;
  }

  return <IngredientDetailsUI ingredientData={ingredientData} />;
};
