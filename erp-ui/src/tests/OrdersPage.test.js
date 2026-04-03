// OrdersPage.test.js
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OrdersPage from './OrdersPageRefactored';
import * as ordersService from '../api/ordersService';

// Mock complet des services
jest.mock('../api/ordersService');
jest.mock('../api/productsService');
jest.mock('../api/customersService');

describe('OrdersPage - Couverture complète', () => {
  const mockToken = 'test-token';
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configuration des mocks par défaut
    ordersService.getOrders.mockResolvedValue([]);
    ordersService.getTotalOrderAmount.mockResolvedValue({ totalOrderAmount: 0 });
    ordersService.createOrder.mockResolvedValue({ _id: 'new-order' });
    ordersService.updateOrder.mockResolvedValue({});
    ordersService.deleteOrder.mockResolvedValue({});
  });

  describe('Tests de rendu', () => {
    test('affiche l\'état de chargement', () => {
      render(<OrdersPage token={mockToken} />);
      expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    });

    test('affiche les KPIs correctement', async () => {
      ordersService.getOrders.mockResolvedValue([{ _id: '1' }, { _id: '2' }]);
      ordersService.getTotalOrderAmount.mockResolvedValue({ totalOrderAmount: 500 });
      
      render(<OrdersPage token={mockToken} />);
      
      await waitFor(() => {
        expect(screen.getByText('Total Orders')).toBeInTheDocument();
        // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
        expect(screen.getByText('2')).toBeInTheDocument();
        // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
        expect(screen.getByText('Total Revenue')).toBeInTheDocument();
        // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
        expect(screen.getByText('$500.00')).toBeInTheDocument();
      });
    });
  });

  describe('Tests de formulaire', () => {
    test('valide les champs requis', async () => {
      render(<OrdersPage token={mockToken} />);
      
      await waitFor(() => {
        expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
      });
      
      const submitButton = screen.getByTestId('submit-order');
      fireEvent.click(submitButton);
      
      expect(await screen.findByText(/Please select a customer/i)).toBeInTheDocument();
    });

    test('crée une commande avec succès', async () => {
      const mockCustomers = [{ _id: 'c1', name: 'Test Customer' }];
      const mockProducts = [{ _id: 'p1', name: 'Test Product', price: 100 }];
      
      require('../api/customersService').getCustomers.mockResolvedValue(mockCustomers);
      require('../api/productsService').getProducts.mockResolvedValue(mockProducts);
      
      render(<OrdersPage token={mockToken} />);
      
      await waitFor(() => {
        expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
      });
      
      // Sélectionner un client
      const customerSelect = screen.getByTestId('customer-select');
      fireEvent.change(customerSelect, { target: { value: 'c1' } });
      
      // Ajouter un produit
      const addButton = screen.getByTestId('add-item-btn');
      fireEvent.click(addButton);
      
      // Remplir le formulaire
      const productSelects = screen.getAllByRole('combobox');
      const quantityInputs = screen.getAllByRole('spinbutton');
      
      fireEvent.change(productSelects[1], { target: { value: 'p1' } });
      fireEvent.change(quantityInputs[1], { target: { value: '2' } });
      
      // Soumettre
      const submitButton = screen.getByTestId('submit-order');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(ordersService.createOrder).toHaveBeenCalledWith(
          expect.objectContaining({
            customerId: 'c1',
            items: expect.arrayContaining([
              expect.objectContaining({ productId: 'p1', quantity: 2 })
            ])
          }),
          mockToken
        );
      });
    });
  });

  describe('Tests de gestion des erreurs', () => {
    test('gère les erreurs API', async () => {
      ordersService.getOrders.mockRejectedValue(new Error('API Error'));
      
      render(<OrdersPage token={mockToken} />);
      
      await waitFor(() => {
        expect(screen.getByText(/API Error/i)).toBeInTheDocument();
      });
    });

    test('gère la suppression avec confirmation', async () => {
      const mockOrders = [{ _id: 'order1', customerId: 'c1', items: [] }];
      ordersService.getOrders.mockResolvedValue(mockOrders);
      
      window.confirm = jest.fn(() => true);
      
      render(<OrdersPage token={mockToken} />);
      
      await waitFor(() => {
        expect(screen.getByText('order1')).toBeInTheDocument();
      });
      
      const deleteButtons = screen.getAllByLabelText(/Delete/i);
      fireEvent.click(deleteButtons[0]);
      
      expect(window.confirm).toHaveBeenCalled();
      await waitFor(() => {
        expect(ordersService.deleteOrder).toHaveBeenCalledWith('order1', mockToken);
      });
    });
  });

  describe('Tests d\'édition', () => {
    test('permet d\'éditer une commande existante', async () => {
      const mockOrders = [{
        _id: 'order1',
        customerId: 'c1',
        items: [{ productId: 'p1', quantity: 2 }]
      }];
      
      ordersService.getOrders.mockResolvedValue(mockOrders);
      
      render(<OrdersPage token={mockToken} />);
      
      await waitFor(() => {
        expect(screen.getByText('order1')).toBeInTheDocument();
      });
      
      const editButtons = screen.getAllByLabelText(/Edit/i);
      fireEvent.click(editButtons[0]);
      
      expect(screen.getByText('Edit Order')).toBeInTheDocument();
      
      const cancelButton = screen.getByTestId('cancel-edit');
      expect(cancelButton).toBeInTheDocument();
      
      fireEvent.click(cancelButton);
      expect(screen.getByText('New Order')).toBeInTheDocument();
    });
  });
});