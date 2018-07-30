import CartParser from './CartParser';
import { readFileSync } from 'fs';

let parser;

beforeEach(() => {
    parser = new CartParser();
});

describe("CartParser - validate", () => {
    it('should be equal empty array if data valid', () => {
        const fileCsvValid = readFileSync('/home/blucbo/MyProjects/git-bohdan/b-test/samples/cart.csv', 'utf-8', 'r');

        expect(parser.validate(fileCsvValid)).toEqual([]);
    });

    it('should be same error if rows other length', () => {
        expect(
            parser.validate(`Product name,Price,Quantity
                             Mollis consequat,9.00,2
                             Tvoluptatem,10.32
                             Scelerisque lacinia,18.90,1
                             Consectetur adipiscing,28.72,10
                             Condimentum aliquet,13.90,1`)
        ).toEqual([
            {
                type: 'row',
                row: 2,
                column: -1,
                message: 'Expected row to have 3 cells but received 2.'
            }
        ]);
    });

    it('should be coll field positive number', () => {
        expect(
            parser.validate(`Product name,Price,Quantity
                             Mollis consequat,9.00,2
                             Scelerisque,sss,10.32
                             Scelerisque lacinia,18.90,1
                             Consectetur adipiscing,28.72,10
                             Condimentum aliquet,13.90,1`)
        ).toEqual([
            {
                type: 'cell',
                row: 2,
                column: 1,
                message: 'Expected cell to be a positive number but received "sss".'
            }
        ]);
    });

    it('shouldn`t be coll field string empty', () => {
        expect(
            parser.validate(`Product name,Price,Quantity
                             Mollis consequat,9.00,2
                             ,22.20,10.32
                             Scelerisque lacinia,18.90,1
                             Consectetur adipiscing,28.72,10
                             Condimentum aliquet,13.90,1`)
        ).toEqual([
            {
                type: 'cell',
                row: 2,
                column: 0,
                message: 'Expected cell to be a nonempty string but received "".'
            }
        ]);
    });

    it('should be same error if one header name invalid', () => {
        expect(
            parser.validate(`Product name,Pricew,Quantity
                             Mollis consequat,9.00,2
                             Tvoluptatem,10.32,1
                             Scelerisque lacinia,18.90,1
                             Consectetur adipiscing,28.72,10
                            Condimentum aliquet,13.90,1`)
        ).toEqual([
            {
                type: 'header',
                row: 0,
                column: 1,
                message: 'Expected header to be named "Price" but received Pricew.'
            }
        ]);
    });
});

describe("CartParser - parseLine", () => {
    it('should be return item with property when data valid', () => {
        const item = parser.parseLine('Mollis consequat,9.00,2');

        expect(item.name).toEqual("Mollis consequat");
        expect(item.price).toEqual(9);
        expect(item.quantity).toEqual(2);
        expect(item).toHaveProperty('id');
    });
});

describe("CartParser - calcTotal", () => {
    it('should be return error if data is valid', () => {
        const items = [
            {
                "id": "3e6def17-5e87-4f27-b6b8-ae78948523a9",
                "name": "Mollis consequat",
                "price": 9,
                "quantity": 2
            },
            {
                "id": "90cd22aa-8bcf-4510-a18d-ec14656d1f6a",
                "name": "Tvoluptatem",
                "price": 10.32,
                "quantity": 1
            },
            {
                "id": "33c14844-8cae-4acd-91ed-6209a6c0bc31",
                "name": "Scelerisque lacinia",
                "price": 18.9,
                "quantity": 1
            },
            {
                "id": "f089a251-a563-46ef-b27b-5c9f6dd0afd3",
                "name": "Consectetur adipiscing",
                "price": 28.72,
                "quantity": 10
            },
            {
                "id": "0d1cbe5e-3de6-4f6a-9c53-bab32c168fbf",
                "name": "Condimentum aliquet",
                "price": 13.9,
                "quantity": 1
            }
        ];

        expect(parser.calcTotal(items)).toBeCloseTo(348.32, 3);
    });

    it('should be return error if data is null', () => {
        expect(() => parser.calcTotal(null)).toThrow();
    });
});


describe("CartParser - parse unit test", () => {

    it('should be error with incorrect path', () => {
        expect(() => {
            return parser.parse('incorrect path');
        }).toThrow();
    });

    it('should be error if file invalid', () => {
        expect(() => {
            return parser.parse('/home/blucbo/MyProjects/git-bohdan/b-test/samples/invalidcart.csv');
        }).toThrow();
    });

    it('should executed without errors if the file is correct', () => {
        expect(() => {
            return parser.parse('/home/blucbo/MyProjects/git-bohdan/b-test/samples/cart.csv');
        }).not.toThrow();
    });

});

describe("CartParser - parse integration test", () => {
    it('should call validate, parseLine, calcTotal', () => {
        parser.validate = jest.fn(() => []);
        parser.parseLine = jest.fn(() => ({
            name: "Mollis consequat",
            price: 9,
            quantity: 2,
            id: 'test'
        }));
        parser.calcTotal = jest.fn((_) => 111.11);

        parser.parse('/home/blucbo/MyProjects/git-bohdan/b-test/samples/cart.csv');

        expect(parser.validate).toHaveBeenCalledTimes(1);
        expect(parser.calcTotal).toHaveBeenCalledTimes(1);
        expect(parser.parseLine).toHaveBeenCalledTimes(5);
    });
});
