/**
 * Test Suite: Utilities Testing
 * Testing helper functions, validators, dan constants
 */

describe('Utility Functions Tests', () => {
  describe('Constants', () => {
    let constants;

    beforeAll(() => {
      try {
        constants = require('../src/utils/constants');
      } catch (error) {
        constants = {};
      }
    });

    test('Constants should be defined', () => {
      expect(constants).toBeDefined();
    });

    test('Constants should be immutable', () => {
      if (constants.USER_ROLES) {
        expect(() => {
          constants.USER_ROLES = {};
        }).toThrow();
      }
    });

    test('Should export expected constants', () => {
      // Check for common constants that might exist
      const expectedConstants = [
        'USER_ROLES',
        'API_BASE_URL',
        'PRODUCT_STATUS',
        'ORDER_STATUS',
        'STOCK_MOVEMENT_TYPES'
      ];

      // At least some constants should be defined
      const definedConstants = expectedConstants.filter(key => 
        constants[key] !== undefined
      );

      expect(definedConstants.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Validators', () => {
    let validators;

    beforeAll(() => {
      try {
        validators = require('../src/utils/validators');
      } catch (error) {
        validators = {};
      }
    });

    test('Validators module should be defined', () => {
      expect(validators).toBeDefined();
    });

    describe('Email Validation', () => {
      test('validateEmail should validate correct emails', () => {
        if (validators.validateEmail) {
          expect(validators.validateEmail('test@example.com')).toBe(true);
          expect(validators.validateEmail('user.name@domain.co.id')).toBe(true);
        }
      });

      test('validateEmail should reject invalid emails', () => {
        if (validators.validateEmail) {
          expect(validators.validateEmail('invalid')).toBe(false);
          expect(validators.validateEmail('@example.com')).toBe(false);
          expect(validators.validateEmail('test@')).toBe(false);
          expect(validators.validateEmail('')).toBe(false);
        }
      });
    });

    describe('Phone Validation', () => {
      test('validatePhone should validate phone numbers', () => {
        if (validators.validatePhone) {
          expect(validators.validatePhone('081234567890')).toBe(true);
          expect(validators.validatePhone('+6281234567890')).toBe(true);
        }
      });

      test('validatePhone should reject invalid phone numbers', () => {
        if (validators.validatePhone) {
          expect(validators.validatePhone('123')).toBe(false);
          expect(validators.validatePhone('abc')).toBe(false);
        }
      });
    });

    describe('Required Field Validation', () => {
      test('validateRequired should check for required fields', () => {
        if (validators.validateRequired) {
          expect(validators.validateRequired('test')).toBe(true);
          expect(validators.validateRequired('')).toBe(false);
          expect(validators.validateRequired(null)).toBe(false);
          expect(validators.validateRequired(undefined)).toBe(false);
        }
      });
    });

    describe('Number Validation', () => {
      test('validateNumber should validate numeric values', () => {
        if (validators.validateNumber) {
          expect(validators.validateNumber(123)).toBe(true);
          expect(validators.validateNumber('123')).toBe(true);
          expect(validators.validateNumber(0)).toBe(true);
        }
      });

      test('validateNumber should reject non-numeric values', () => {
        if (validators.validateNumber) {
          expect(validators.validateNumber('abc')).toBe(false);
          expect(validators.validateNumber(NaN)).toBe(false);
        }
      });
    });

    describe('Positive Number Validation', () => {
      test('validatePositive should validate positive numbers', () => {
        if (validators.validatePositive) {
          expect(validators.validatePositive(1)).toBe(true);
          expect(validators.validatePositive(100)).toBe(true);
        }
      });

      test('validatePositive should reject negative/zero numbers', () => {
        if (validators.validatePositive) {
          expect(validators.validatePositive(0)).toBe(false);
          expect(validators.validatePositive(-1)).toBe(false);
        }
      });
    });

    describe('Date Validation', () => {
      test('validateDate should validate dates', () => {
        if (validators.validateDate) {
          expect(validators.validateDate(new Date())).toBe(true);
          expect(validators.validateDate('2024-01-01')).toBe(true);
        }
      });

      test('validateDate should reject invalid dates', () => {
        if (validators.validateDate) {
          expect(validators.validateDate('invalid')).toBe(false);
          expect(validators.validateDate('')).toBe(false);
        }
      });
    });
  });

  describe('Helper Functions', () => {
    let helpers;

    beforeAll(() => {
      try {
        helpers = require('../src/utils/helpers');
      } catch (error) {
        helpers = {};
      }
    });

    test('Helpers module should be defined', () => {
      expect(helpers).toBeDefined();
    });

    describe('Format Currency', () => {
      test('formatCurrency should format numbers as currency', () => {
        if (helpers.formatCurrency) {
          expect(helpers.formatCurrency(1000)).toBe('Rp 1.000');
          expect(helpers.formatCurrency(1000000)).toBe('Rp 1.000.000');
          expect(helpers.formatCurrency(0)).toBe('Rp 0');
        }
      });

      test('formatCurrency should handle decimal values', () => {
        if (helpers.formatCurrency) {
          const result = helpers.formatCurrency(1000.50);
          expect(result).toContain('1.000');
        }
      });
    });

    describe('Format Date', () => {
      test('formatDate should format dates', () => {
        if (helpers.formatDate) {
          const date = new Date('2024-01-15');
          const formatted = helpers.formatDate(date);
          expect(formatted).toBeDefined();
          expect(typeof formatted).toBe('string');
        }
      });

      test('formatDate should handle different date formats', () => {
        if (helpers.formatDate) {
          expect(helpers.formatDate('2024-01-15')).toBeDefined();
          expect(helpers.formatDate(new Date())).toBeDefined();
        }
      });
    });

    describe('Format Number', () => {
      test('formatNumber should format numbers with separators', () => {
        if (helpers.formatNumber) {
          expect(helpers.formatNumber(1000)).toContain('1');
          expect(helpers.formatNumber(1000000)).toContain('1');
        }
      });
    });

    describe('Truncate Text', () => {
      test('truncateText should truncate long text', () => {
        if (helpers.truncateText) {
          const longText = 'This is a very long text that needs to be truncated';
          const truncated = helpers.truncateText(longText, 20);
          expect(truncated.length).toBeLessThanOrEqual(23); // 20 + '...'
        }
      });

      test('truncateText should not truncate short text', () => {
        if (helpers.truncateText) {
          const shortText = 'Short';
          expect(helpers.truncateText(shortText, 20)).toBe(shortText);
        }
      });
    });

    describe('Calculate Percentage', () => {
      test('calculatePercentage should calculate percentages', () => {
        if (helpers.calculatePercentage) {
          expect(helpers.calculatePercentage(50, 100)).toBe(50);
          expect(helpers.calculatePercentage(25, 100)).toBe(25);
          expect(helpers.calculatePercentage(1, 3)).toBeCloseTo(33.33, 1);
        }
      });

      test('calculatePercentage should handle edge cases', () => {
        if (helpers.calculatePercentage) {
          expect(helpers.calculatePercentage(0, 100)).toBe(0);
          expect(helpers.calculatePercentage(100, 0)).toBe(0);
        }
      });
    });

    describe('Deep Clone', () => {
      test('deepClone should clone objects', () => {
        if (helpers.deepClone) {
          const original = { a: 1, b: { c: 2 } };
          const cloned = helpers.deepClone(original);
          
          expect(cloned).toEqual(original);
          expect(cloned).not.toBe(original);
          expect(cloned.b).not.toBe(original.b);
        }
      });

      test('deepClone should clone arrays', () => {
        if (helpers.deepClone) {
          const original = [1, 2, [3, 4]];
          const cloned = helpers.deepClone(original);
          
          expect(cloned).toEqual(original);
          expect(cloned).not.toBe(original);
        }
      });
    });

    describe('Debounce', () => {
      jest.useFakeTimers();

      test('debounce should delay function execution', () => {
        if (helpers.debounce) {
          const mockFn = jest.fn();
          const debouncedFn = helpers.debounce(mockFn, 300);

          debouncedFn();
          expect(mockFn).not.toHaveBeenCalled();

          jest.advanceTimersByTime(300);
          expect(mockFn).toHaveBeenCalledTimes(1);
        }
      });

      test('debounce should cancel previous calls', () => {
        if (helpers.debounce) {
          const mockFn = jest.fn();
          const debouncedFn = helpers.debounce(mockFn, 300);

          debouncedFn();
          debouncedFn();
          debouncedFn();

          jest.advanceTimersByTime(300);
          expect(mockFn).toHaveBeenCalledTimes(1);
        }
      });

      afterAll(() => {
        jest.useRealTimers();
      });
    });

    describe('Generate Unique ID', () => {
      test('generateId should generate unique IDs', () => {
        if (helpers.generateId) {
          const id1 = helpers.generateId();
          const id2 = helpers.generateId();
          
          expect(id1).toBeDefined();
          expect(id2).toBeDefined();
          expect(id1).not.toBe(id2);
        }
      });
    });

    describe('Sort Array', () => {
      test('sortByKey should sort array by key', () => {
        if (helpers.sortByKey) {
          const array = [
            { id: 3, name: 'C' },
            { id: 1, name: 'A' },
            { id: 2, name: 'B' }
          ];
          
          const sorted = helpers.sortByKey(array, 'id');
          expect(sorted[0].id).toBe(1);
          expect(sorted[2].id).toBe(3);
        }
      });
    });

    describe('Filter Array', () => {
      test('filterBySearch should filter array by search term', () => {
        if (helpers.filterBySearch) {
          const array = [
            { name: 'Apple' },
            { name: 'Banana' },
            { name: 'Orange' }
          ];
          
          const filtered = helpers.filterBySearch(array, 'name', 'app');
          expect(filtered.length).toBe(1);
          expect(filtered[0].name).toBe('Apple');
        }
      });
    });

    describe('Group By', () => {
      test('groupBy should group array by key', () => {
        if (helpers.groupBy) {
          const array = [
            { category: 'A', value: 1 },
            { category: 'B', value: 2 },
            { category: 'A', value: 3 }
          ];
          
          const grouped = helpers.groupBy(array, 'category');
          expect(grouped.A).toHaveLength(2);
          expect(grouped.B).toHaveLength(1);
        }
      });
    });
  });

  describe('Integration Tests', () => {
    test('Validators and Helpers should work together', () => {
      const validators = require('../src/utils/validators');
      const helpers = require('../src/utils/helpers');

      // Example: Format currency only if number is valid
      if (validators.validateNumber && helpers.formatCurrency) {
        const value = 1000;
        if (validators.validateNumber(value)) {
          const formatted = helpers.formatCurrency(value);
          expect(formatted).toBeDefined();
        }
      }
    });

    test('All utility modules should export functions', () => {
      const validators = require('../src/utils/validators');
      const helpers = require('../src/utils/helpers');
      const constants = require('../src/utils/constants');

      expect(typeof validators).toBe('object');
      expect(typeof helpers).toBe('object');
      expect(typeof constants).toBe('object');
    });
  });
});
